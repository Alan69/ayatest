FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./

RUN npm install

# Copy the source code
COPY . .

# Build the application for production
RUN npm run build

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 