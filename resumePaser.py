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
        return text.strip()
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")

class ResumeAnalyzer:
    """
    A class to analyze the match between a resume and job description.
    """
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        self.max_token_limit = 15000
        self.used_tokens = 0

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using simple keyword matching."""
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
        Analyze how well a resume matches a job description using Groq.
        
        Args:
            resume_text (str): Text extracted from the resume
            job_description (str): Formatted job description
            
        Returns:
            str: Enhanced analysis report using Groq feedback
        """
        if self.used_tokens >= self.max_token_limit:
            return "Token limit reached. Please try again later."
        
        prompt = [
            {"role": "system", "content": "You are a career coach assessing a resume against a job description."},
            {"role": "user", "content": f"Job Description: {job_description}"},
            {"role": "user", "content": f"Resume: {resume_text}"},
            {"role": "user", "content": (
                "Analyze how well the resume matches the job description without making any assumptions about skills not explicitly listed. "
                "In your response:\n"
                "1. **Alignment**: List only the skills, experiences, and qualifications from the resume that directly match the job description, and ensure they are explicitly stated in both. Do not infer skills.\n"
                "2. **Skills that are missing**: Identify skills and qualifications from the job description that are absent in the resume.\n"
                "3. **Suggestions for improvement**: Provide actionable feedback to improve the resume's alignment, such as adding specific skills, experience, or quantifiable achievements relevant to the job description.\n\n"
                "Be critical and maintain high accuracy in matching skills. If something is not clearly stated in the resume or job description, do not make any assumptions about its relevance.\n"
                "4. **Suggest roles best suited to the applicant based on their resume.\n**"
                "4. **Finally classify the candidate based on the following: Strong Hire, Possible Hire, Weak Hire or No Hire. And give them an overall single score on 1-10 Scale with 10 representing Strong Hire, and 1 representing No Hire **"
            )}
        ]
        
        try:
            response = self.groq_client.chat.completions.create(
                messages=prompt,
                model="llama3-8b-8192"
            )
            feedback = response.choices[0].message.content
            # Estimate tokens used
            self.used_tokens += len(resume_text.split()) + len(job_description.split())
        except Exception as e:
            feedback = f"An error occurred while analyzing with Groq: {e}"
        
        return feedback

def main():
    Tk().withdraw()  # Hide the root window
    
    # Limit user to selecting up to 3 resumes
    resume_paths = filedialog.askopenfilenames(title="Select up to 3 Resume PDFs", 
                                               filetypes=[("PDF files", "*.pdf")],
                                               multiple=True)
    if len(resume_paths) > 3:
        messagebox.showerror("Selection Error", "Please select up to 3 resumes only.")
        return

    if resume_paths:
        job_description = input("Please paste the job description here:\n")
        analyzer = ResumeAnalyzer()
        
        for resume_path in resume_paths:
            try:
                resume_text = read_text_from_pdf(resume_path)
                feedback = analyzer.analyze_match_with_groq(resume_text, job_description)
                print(f"\nFeedback for {os.path.basename(resume_path)}:\n{feedback}\n")
            except Exception as e:
                print(f"Error processing {os.path.basename(resume_path)}: {e}")
    else:
        print("No resume files selected.")

if __name__ == "__main__":
    main()
