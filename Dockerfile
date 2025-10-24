# Use Node.js 18 or higher
FROM node:18-alpine

# Create working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port (Cloud Run expects 8080)
EXPOSE 8080

# Start Next.js server
CMD ["npm", "start"]
