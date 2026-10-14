# --- Stage 1: Build the React Frontend ---
# Use an official Node.js runtime as the base image
FROM node:18-alpine AS frontend-builder

# Set the working directory in the container
WORKDIR /app/frontend

# Copy package.json and package-lock.json (or yarn.lock)
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the production version of the React app
# This creates a 'dist' folder with static files
RUN npm run build


# --- Stage 2: Build the Python Backend ---
# Use an official Python runtime as the base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Set environment variables to prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies that might be needed by Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory
COPY ./backend /app

# --- ✨ Crucial Step: Copy the built frontend from the first stage ---
# The path '/app/static' assumes you will configure FastAPI to serve files from there
COPY --from=frontend-builder /app/frontend/dist /app/static


# Expose the port the app runs on
EXPOSE 8080

# The command to run the application using Uvicorn
# It will listen on all network interfaces (0.0.0.0) on port 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
