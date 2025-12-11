# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

ENV DATABASE_URL=postgresql://myuser:mypassword@db:5432/mydb
#ENV DATABASE_URL=postgresql://neondb_owner:npg_WvVCLKX4Y0kP@ep-snowy-pine-a9bz947d-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# Expose port
EXPOSE 8000

# Run the FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]