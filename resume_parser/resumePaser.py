import os
from typing import List
import fitz
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def read_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text from the PDF
    """
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")

class ResumeAnalyzer:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("Missing GROQ_API_KEY in environment variables")
            
        self.groq_client = Groq(api_key=api_key)
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        self.max_token_limit = 15000
        self.used_tokens = 0

    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from text using keyword matching.
        
        Args:
            text (str): Text to extract skills from
            
        Returns:
            List[str]: List of extracted skills
        """
        skill_indicators = [
            'proficient in', 'experience with', 'skilled in',
            'knowledge of', 'familiar with', 'expertise in'
        ]
        skills = set()
        
        for sentence in text.lower().split('.'):
            for indicator in skill_indicators:
                if indicator in sentence:
                    skills.update(
                        skill.strip()
                        for skill in sentence.split(indicator)[1].split(',')
                        if skill.strip()
                    )
        
        return list(skills)

    def analyze_match_with_groq(self, resume_text: str, job_description: str) -> str:
        """
        Analyze resume against job description using Groq API.
        
        Args:
            resume_text (str): Text extracted from resume
            job_description (str): Job description text
            
        Returns:
            str: Analysis feedback
        """
        if not resume_text or not job_description:
            return "Resume text and job description cannot be empty."
            
        if self.used_tokens >= self.max_token_limit:
            return "Token limit reached. Please try again later."

        prompt = [
            {"role": "system", "content": "You are a career coach assessing a resume against a job description."},
            {"role": "user", "content": f"Job Description: {job_description}"},
            {"role": "user", "content": f"Resume: {resume_text}"},
            {"role": "user", "content": (
                "Please provide a detailed analysis of how well this resume matches the job description. "
                "Include the following sections:\n"
                "1. Key Skills Match: List the skills that align well with the job requirements\n"
                "2. Missing Skills: Identify important skills from the job description that are not evident in the resume\n"
                "3. Experience Alignment: Evaluate how well the candidate's experience matches the role\n"
                "4. Improvement Suggestions: Specific recommendations for strengthening the application\n"
                "5. Overall Rating: Score from 1-10 (10 being perfect match) with brief explanation\n\n"
                "Focus on concrete evidence from the resume without making assumptions about unlisted skills."
            )}
        ]

        try:
            response = self.groq_client.chat.completions.create(
                messages=prompt,
                model="llama3-8b-8192",
                temperature=0.7,
                max_tokens=2000,
                top_p=1,
                stop=None
            )
            
            feedback = response.choices[0].message.content
            self.used_tokens += len(resume_text.split()) + len(job_description.split())
            
            # Structure the feedback
            return {
                "Analysis": feedback,
                "ExtractedSkills": self.extract_skills(resume_text)
            }
            
        except Exception as e:
            return f"Error during analysis: {str(e)}"

    def reset_token_count(self):
        """Reset the token count for new analysis session."""
        self.used_tokens = 0