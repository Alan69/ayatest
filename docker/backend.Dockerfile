FROM golang:1.23-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Expose port
EXPOSE 8080

# Run the server directly
CMD ["go", "run", "./cmd/server"] 