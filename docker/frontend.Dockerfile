FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./

RUN npm ci

# Copy the source code
COPY frontend/ .

# Build the application for production
RUN npm run build

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 