import os
import re
import tempfile
import logging
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
    def __init__(self):  # Fixed initialization method name
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("Missing GROQ_API_KEY in environment variables.")
            
        self.groq_client = Groq(api_key=api_key)
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        self.max_token_limit = 15000
        self.used_tokens = 0

    def analyze_match_with_groq(self, resume_text: str, job_description: str) -> str:
        if not resume_text or not job_description:
            return "Resume text and job description cannot be empty."
            
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
            return feedback
        except Exception as e:
            error_msg = f"An error occurred while analyzing with Groq: {str(e)}"
            logging.error(error_msg)
            return error_msg

# View to Render the Index Page
def index(request):
    return render(request, "index.html")

# View to Analyze Resume
logger = logging.getLogger(__name__)
@csrf_exempt
def analyze_resume(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=405)
        
    try:
        resume_file = request.FILES.get('resume')
        job_description = request.POST.get('job_description')

        if not resume_file:
            return JsonResponse({"error": "Resume file is missing in the request."}, status=400)
        if not job_description:
            return JsonResponse({"error": "Job description is missing."}, status=400)

        # Create a secure temporary file
        sanitized_filename = re.sub(r'[^\w\-.]', '_', resume_file.name)
        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, sanitized_filename)

        try:
            # Save and process the uploaded file
            with open(file_path, "wb") as f:
                for chunk in resume_file.chunks():
                    f.write(chunk)

            resume_text = read_text_from_pdf(file_path)
            
            # Initialize analyzer and get feedback
            analyzer = ResumeAnalyzer()
            feedback = analyzer.analyze_match_with_groq(resume_text, job_description)

            return JsonResponse({"feedback": feedback}, status=200)

        except Exception as e:
            error_msg = f"Error processing resume: {str(e)}"
            logger.error(error_msg)
            return JsonResponse({"error": error_msg}, status=500)
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)

    except Exception as e:
        error_msg = f"Error analyzing resume: {str(e)}"
        logger.error(error_msg)
        return JsonResponse({"error": error_msg}, status=500)