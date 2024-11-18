from django.urls import path
from .views import index, analyze_resume  # Correct import

urlpatterns = [
    path('', index, name='index'),
    path('analyze-resume/', analyze_resume, name='analyze_resume'),
]
