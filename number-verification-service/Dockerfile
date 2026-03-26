# Use lightweight Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port (will override in compose)
EXPOSE 3000

# Start app
CMD ["node", "src/app.js"]