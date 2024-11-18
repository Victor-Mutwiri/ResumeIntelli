import os
import re
from typing import List
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from sentence_transformers import SentenceTransformer
import fitz  # PyMuPDF for PDF handling
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Read PDF Text Function
def read_text_from_pdf(pdf_path: str) -> str:
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text.strip()
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")

# Resume Analyzer Class
class ResumeAnalyzer:
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        self.max_token_limit = 15000
        self.used_tokens = 0

    def extract_skills(self, text: str) -> List[str]:
        skill_indicators = ['proficient in', 'experience with', 'skilled in', 
                            'knowledge of', 'familiar with', 'expertise in']
        skills = set()
        sentences = text.lower().split('.')
        
        for sentence in sentences:
            for indicator in skill_indicators:
                if indicator in sentence:
                    parts = sentence.split(indicator)
                    if len(parts) > 1:
                        potential_skills = re.split(r'[,;&]', parts[1])
                        skills.update(skill.strip() for skill in potential_skills if skill.strip())
        
        return list(skills)

    def analyze_match_with_groq(self, resume_text: str, job_description: str) -> str:
        if self.used_tokens >= self.max_token_limit:
            return "Token limit reached. Please try again later."
        
        prompt = [
            {"role": "system", "content": "You are a career coach assessing a resume against a job description."},
            {"role": "user", "content": f"Job Description: {job_description}"},
            {"role": "user", "content": f"Resume: {resume_text}"},
            {"role": "user", "content": (
                "Analyze how well the resume matches the job description without making any assumptions about skills not explicitly listed. "
                "Provide alignment, missing skills, improvement suggestions, role suitability, and a rating."
            )}
        ]
        
        try:
            response = self.groq_client.chat.completions.create(
                messages=prompt,
                model="llama3-8b-8192"
            )
            feedback = response.choices[0].message.content
            self.used_tokens += len(resume_text.split()) + len(job_description.split())
        except Exception as e:
            feedback = f"An error occurred while analyzing with Groq: {e}"
        
        return feedback

# View to Render the Index Page
def index(request):
    """
    Renders the index page for uploading resumes and job descriptions.
    """
    return render(request, "index.html")

# View to Analyze Resume
@csrf_exempt
def analyze_resume(request):
    if request.method == "POST":
        try:
            # Expecting a file upload and job description from the frontend
            resume_file = request.FILES.get('resume')
            job_description = request.POST.get('job_description')

            if not resume_file or not job_description:
                return JsonResponse({"error": "Resume file and job description are required."}, status=400)
            
            # Save and read the uploaded file
            file_path = f"/tmp/{resume_file.name}"
            with open(file_path, "wb") as f:
                for chunk in resume_file.chunks():
                    f.write(chunk)

            resume_text = read_text_from_pdf(file_path)

            # Analyze resume
            analyzer = ResumeAnalyzer()
            feedback = analyzer.analyze_match_with_groq(resume_text, job_description)

            return JsonResponse({"feedback": feedback}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=405)
