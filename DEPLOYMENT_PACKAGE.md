# Files to include in deployment ZIP

## Include:
- server.js
- package.json
- package-lock.json
- config/oauth.js
- services/calendarService.js
- services/gmailService.js
- Dockerfile
- .dockerignore

## Exclude:
- node_modules/
- .env (will be set via Cloud Run environment variables)
- test-*.js
- mcp-server.js (not needed for webhook)
- *.md files (documentation)
- .git/

## Instructions:

### Option 1: Manual ZIP Creation
1. Create a new folder called "deploy"
2. Copy these files maintaining folder structure:
   - server.js
   - package.json
   - package-lock.json
   - Dockerfile
   - .dockerignore
   - config/oauth.js
   - services/calendarService.js
   - services/gmailService.js
3. ZIP the "deploy" folder

### Option 2: Use PowerShell Script
Run the script below to create deployment.zip automatically
