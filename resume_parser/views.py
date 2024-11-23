import os
import tempfile
import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .resumePaser import ResumeAnalyzer, read_text_from_pdf

logger = logging.getLogger(__name__)

def index(request):
    return render(request, "index.html")

@csrf_exempt
def analyze_resume(request):
    if request.method != "POST":
        logger.warning("Invalid request method: %s", request.method)
        return JsonResponse({"error": "Invalid request method."}, status=405)

    try:
        resume_files = request.FILES.getlist('resumes')
        job_description = request.POST.get('job_description')

        if not resume_files:
            logger.error("No resumes uploaded in the request.")
            return JsonResponse({"error": "No resume files uploaded."}, status=400)
        if len(resume_files) > 3:
            logger.error("Too many resumes uploaded. Limit: 3, Received: %d", len(resume_files))
            return JsonResponse({"error": "Maximum 3 resumes allowed."}, status=400)
        if not job_description:
            logger.error("Missing job description in the request.")
            return JsonResponse({"error": "Job description is required."}, status=400)

        analyzer = ResumeAnalyzer()
        feedback_results = []

        for resume_file in resume_files:
            try:
                logger.info("Processing file: %s", resume_file.name)
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                    for chunk in resume_file.chunks():
                        temp_file.write(chunk)
                    temp_path = temp_file.name

                # Analyze the resume
                logger.info("Reading and analyzing text for: %s", resume_file.name)
                resume_text = read_text_from_pdf(temp_path)
                feedback = analyzer.analyze_match_with_groq(resume_text, job_description)
                feedback_results.append({"filename": resume_file.name, "feedback": feedback})

            except Exception as e:
                logger.error("Error processing file %s: %s", resume_file.name, str(e))
                feedback_results.append({
                    "filename": resume_file.name,
                    "feedback": f"Error processing resume: {str(e)}. Ensure the file is a valid PDF."
                })

            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    logger.info("Temporary file deleted: %s", temp_path)

        logger.info("All resumes processed successfully.")
        return JsonResponse({"feedback": feedback_results}, status=200)

    except Exception as e:
        error_msg = f"Critical error analyzing resumes: {str(e)}"
        logger.critical(error_msg, exc_info=True)
        return JsonResponse({"error": error_msg}, status=500)
