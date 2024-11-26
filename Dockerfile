# Use the official Python image from Docker Hub
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy project files to the container
COPY . /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc libpq-dev

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Collect static files (if you have any)
RUN python manage.py collectstatic --no-input

# Expose the port on which the app runs
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "ResumeIntelli.wsgi:application", "--bind", "0.0.0.0:8000"]
