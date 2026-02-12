# Google Cloud Run Deployment Script (PowerShell)
# This script deploys the webhook server to Google Cloud Run

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying to Google Cloud Run..." -ForegroundColor Cyan

# Configuration
$PROJECT_ID = if ($env:GCLOUD_PROJECT_ID) { $env:GCLOUD_PROJECT_ID } else { "your-project-id" }
$SERVICE_NAME = "calendar-gmail-webhook"
$REGION = "us-central1"

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Set project
Write-Host "📋 Setting project to: $PROJECT_ID" -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Deploy to Cloud Run
Write-Host "📦 Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
  --source . `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --timeout 60 `
  --max-instances 10

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME `
  --region $REGION `
  --format 'value(status.url)'

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Service URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host "🔗 Webhook URL: $SERVICE_URL/vapi-webhook" -ForegroundColor Cyan
Write-Host "🔐 Auth URL: $SERVICE_URL/auth" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Add this redirect URI to Google Cloud Console OAuth settings:"
Write-Host "   $SERVICE_URL/auth/callback" -ForegroundColor White
Write-Host ""
Write-Host "2. Set environment variables in Cloud Run:" -ForegroundColor Yellow
Write-Host "   gcloud run services update $SERVICE_NAME ``" -ForegroundColor White
Write-Host "     --region $REGION ``" -ForegroundColor White
Write-Host "     --set-env-vars CLIENT_ID=your_client_id,CLIENT_SECRET=your_secret,REDIRECT_URI=$SERVICE_URL/auth/callback" -ForegroundColor White
Write-Host ""
Write-Host "3. Authenticate by visiting: $SERVICE_URL/auth" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Use this webhook URL in VAPI: $SERVICE_URL/vapi-webhook" -ForegroundColor Yellow
