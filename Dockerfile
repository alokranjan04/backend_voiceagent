FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
