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
        return JsonResponse({"error": "Invalid request method."}, status=405)
        
    try:
        resume_files = request.FILES.getlist('resumes')
        job_description = request.POST.get('job_description')

        if not resume_files:
            return JsonResponse({"error": "No resume files uploaded."}, status=400)
        if len(resume_files) > 3:
            return JsonResponse({"error": "Maximum 3 resumes allowed."}, status=400)
        if not job_description:
            return JsonResponse({"error": "Job description is required."}, status=400)

        analyzer = ResumeAnalyzer()
        feedback_results = []

        for resume_file in resume_files:
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                for chunk in resume_file.chunks():
                    temp_file.write(chunk)
                temp_path = temp_file.name

            try:
                # Process resume
                resume_text = read_text_from_pdf(temp_path)
                feedback = analyzer.analyze_match_with_groq(resume_text, job_description)
                
                feedback_results.append({
                    "filename": resume_file.name,
                    "feedback": feedback
                })

            except Exception as e:
                logger.error(f"Error processing {resume_file.name}: {str(e)}")
                feedback_results.append({
                    "filename": resume_file.name,
                    "feedback": f"Error processing resume: {str(e)}"
                })
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        return JsonResponse({"feedback": feedback_results}, status=200)

    except Exception as e:
        error_msg = f"Error analyzing resumes: {str(e)}"
        logger.error(error_msg)
        return JsonResponse({"error": error_msg}, status=500)