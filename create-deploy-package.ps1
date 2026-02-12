# Create deployment ZIP for Google Cloud Run
# Run this script from the project root directory

Write-Host "Creating deployment package..." -ForegroundColor Cyan

# Create temp directory
$deployDir = ".\deploy-temp"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy necessary files
Write-Host "Copying files..." -ForegroundColor Yellow

# Root files
Copy-Item "server.js" $deployDir
Copy-Item "package.json" $deployDir
Copy-Item "package-lock.json" $deployDir
Copy-Item "Dockerfile" $deployDir
Copy-Item ".dockerignore" $deployDir

# Config directory
New-Item -ItemType Directory -Path "$deployDir\config" | Out-Null
Copy-Item "config\oauth.js" "$deployDir\config\"

# Services directory
New-Item -ItemType Directory -Path "$deployDir\services" | Out-Null
Copy-Item "services\calendarService.js" "$deployDir\services\"
Copy-Item "services\gmailService.js" "$deployDir\services\"

# Create ZIP
Write-Host "Creating ZIP file..." -ForegroundColor Yellow
$zipPath = ".\calendar-gmail-webhook-deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$deployDir\*" -DestinationPath $zipPath

# Cleanup
Remove-Item $deployDir -Recurse -Force

Write-Host ""
Write-Host "✅ Deployment package created: $zipPath" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. In Google Cloud Console, click 'Deploy container'" -ForegroundColor White
Write-Host "2. Select 'Source code' or 'Upload from computer'" -ForegroundColor White
Write-Host "3. Upload: calendar-gmail-webhook-deploy.zip" -ForegroundColor White
Write-Host "4. Configure service settings" -ForegroundColor White
Write-Host "5. Add environment variables" -ForegroundColor White
