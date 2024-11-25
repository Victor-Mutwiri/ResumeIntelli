from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('resume_parser.urls')),  # Home screen
    path('resume/', include('resume_parser.urls')),  # Include app URLs
]
