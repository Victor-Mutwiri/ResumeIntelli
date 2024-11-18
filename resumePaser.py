import fitz  # PyMuPDF for PDF handling
from sentence_transformers import SentenceTransformer
import os
import re
from tkinter import Tk, filedialog, messagebox
from typing import List
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

# Constants
MAX_RESUME_COUNT = 3
MAX_TOKEN_LIMIT = 15000

def read_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file.

    Args:
        pdf_path (str): Path to the PDF file.
        
    Returns:
        str: Extracted text from the PDF.
    """
    try:
        doc = fitz.open(pdf_path)
        text = "".join(page.get_text() for page in doc)
        return text.strip()
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")

class ResumeAnalyzer:
    """
    A class to analyze the match between a resume and job description.
    """
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("Missing GROQ_API_KEY in environment variables.")
        
        self.groq_client = Groq(api_key=api_key)
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        self.max_token_limit = MAX_TOKEN_LIMIT
        self.used_tokens = 0

    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from text using keyword matching.
        
        Args:
            text (str): Resume text.
            
        Returns:
            List[str]: Extracted skills.
        """
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
        """
        Analyze the resume against a job description using Groq.

        Args:
            resume_text (str): Text extracted from the resume.
            job_description (str): Job description.

        Returns:
            str: Analysis feedback.
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
                "Analyze how well the resume matches the job description without making any assumptions about skills not explicitly listed. "
                "Provide alignment, missing skills, improvement suggestions, role suitability, and a final rating with a score (1-10)."
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
            feedback = f"Error during analysis: {str(e)}"
        
        return feedback

def main():
    Tk().withdraw()  # Hide the root window

    # File Selection
    resume_paths = filedialog.askopenfilenames(
        title=f"Select up to {MAX_RESUME_COUNT} Resume PDFs",
        filetypes=[("PDF files", "*.pdf")],
        multiple=True
    )
    if len(resume_paths) > MAX_RESUME_COUNT:
        messagebox.showerror("Selection Error", f"Please select up to {MAX_RESUME_COUNT} resumes only.")
        return

    if not resume_paths:
        print("No resume files selected.")
        return

    # Job Description Input
    job_description = input("Please paste the job description here:\n").strip()
    if not job_description:
        print("Job description is required.")
        return

    # Resume Analysis
    try:
        analyzer = ResumeAnalyzer()
        for resume_path in resume_paths:
            try:
                resume_text = read_text_from_pdf(resume_path)
                feedback = analyzer.analyze_match_with_groq(resume_text, job_description)
                print(f"\nFeedback for {os.path.basename(resume_path)}:\n{feedback}\n")
            except Exception as e:
                print(f"Error processing {os.path.basename(resume_path)}: {e}")
    except Exception as e:
        print(f"Error initializing ResumeAnalyzer: {e}")

if __name__ == "__main__":
    main()
