import os
import tempfile
import logging
import traceback
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .resumePaser import ResumeAnalyzer, read_text_from_pdf

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def index(request):
    return render(request, "index.html")

@csrf_exempt
def analyze_resume(request):
    if request.method != "POST":
        logger.warning("Invalid request method: %s", request.method)
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        logger.debug("Received resume analysis request")
        resume_files = request.FILES.getlist('resumes')
        job_description = request.POST.get('job_description', '').strip()

        if not resume_files:
            logger.warning("No resume files provided in request")
            return JsonResponse({"error": "No resume files uploaded."}, status=400)
        if len(resume_files) > 3:
            logger.warning("Too many resume files: %d", len(resume_files))
            return JsonResponse({"error": "Maximum 3 resumes allowed."}, status=400)
        if not job_description:
            logger.warning("No job description provided")
            return JsonResponse({"error": "Job description is required."}, status=400)

        try:
            analyzer = ResumeAnalyzer()
        except ValueError as e:
            logger.error("Failed to initialize ResumeAnalyzer: %s", str(e))
            return JsonResponse({
                "error": "Failed to initialize analysis service. Please check your API configuration.",
                "details": str(e)
            }, status=500)

        feedback_results = []

        for resume_file in resume_files:
            logger.debug("Processing file: %s", resume_file.name)
            
            if not resume_file.name.lower().endswith('.pdf'):
                logger.warning("Invalid file type for %s", resume_file.name)
                feedback_results.append({
                    "filename": resume_file.name,
                    "feedback": "Error: Only PDF files are supported."
                })
                continue

            temp_path = None
            try:
                # Save the uploaded file temporarily
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                    for chunk in resume_file.chunks():
                        temp_file.write(chunk)
                    temp_path = temp_file.name
                logger.debug("Saved temporary file: %s", temp_path)

                # Extract text from the PDF
                resume_text = read_text_from_pdf(temp_path)
                if not resume_text.strip():
                    raise ValueError("No text could be extracted from the PDF")

                # Analyze resume using Groq
                feedback = analyzer.analyze_match_with_groq(resume_text, job_description)
                
                # Validate feedback structure
                if not isinstance(feedback, dict):
                    raise ValueError("Invalid feedback format received from analyzer")
                
                if "Analysis" not in feedback:
                    raise ValueError("Missing Analysis in feedback")
                
                feedback_results.append({
                    "filename": resume_file.name,
                    "feedback": {
                        "Analysis": feedback["Analysis"],
                        #"ExtractedSkills": feedback.get("ExtractedSkills", [])
                    }
                })
                
                logger.debug("Analysis completed for %s", resume_file.name)

            except ValueError as e:
                logger.error("Value error processing %s: %s", resume_file.name, str(e))
                feedback_results.append({
                    "filename": resume_file.name,
                    "feedback": {
                        "error": str(e)
                    }
                })
            except Exception as e:
                logger.error("Unexpected error processing %s: %s", resume_file.name, str(e))
                logger.error(traceback.format_exc())
                feedback_results.append({
                    "filename": resume_file.name,
                    "feedback": {
                        "error": "Error processing resume",
                        "details": str(e)
                    }
                })
            finally:
                if temp_path and os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                        logger.debug("Removed temporary file: %s", temp_path)
                    except Exception as e:
                        logger.warning("Failed to delete temporary file %s: %s", temp_path, str(e))

        logger.debug("Completed processing all resumes")
        logger.debug("Analysis Results:")
        for result in feedback_results:
            print(f"Filename: {result.get('filename', 'Unknown')}")
            print(f"Feedback: {result.get('feedback', 'No feedback')}")
            print("---")
        return JsonResponse({"feedback": feedback_results})

    except Exception as e:
        logger.error("Critical error in analyze_resume: %s", str(e))
        logger.error(traceback.format_exc())
        return JsonResponse({
            "error": "An unexpected error occurred",
            "details": str(e)
        }, status=500)