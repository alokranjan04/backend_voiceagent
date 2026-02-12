#!/bin/bash

# Google Cloud Run Deployment Script
# This script deploys the webhook server to Google Cloud Run

set -e  # Exit on error

echo "🚀 Deploying to Google Cloud Run..."

# Configuration
PROJECT_ID="${GCLOUD_PROJECT_ID:-your-project-id}"
SERVICE_NAME="calendar-gmail-webhook"
REGION="us-central1"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Not logged in to gcloud. Running 'gcloud auth login'..."
    gcloud auth login
fi

# Set project
echo "📋 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Deploy to Cloud Run
echo "📦 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --timeout 60 \
  --max-instances 10

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)')

echo ""
echo "✅ Deployment successful!"
echo ""
echo "📍 Service URL: $SERVICE_URL"
echo "🔗 Webhook URL: $SERVICE_URL/vapi-webhook"
echo "🔐 Auth URL: $SERVICE_URL/auth"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Add this redirect URI to Google Cloud Console OAuth settings:"
echo "   $SERVICE_URL/auth/callback"
echo ""
echo "2. Set environment variables in Cloud Run:"
echo "   gcloud run services update $SERVICE_NAME \\"
echo "     --region $REGION \\"
echo "     --set-env-vars CLIENT_ID=your_client_id,CLIENT_SECRET=your_secret,REDIRECT_URI=$SERVICE_URL/auth/callback"
echo ""
echo "3. Authenticate by visiting: $SERVICE_URL/auth"
echo ""
echo "4. Use this webhook URL in VAPI: $SERVICE_URL/vapi-webhook"
