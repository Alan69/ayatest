FROM golang:1.20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum
COPY internal/go.mod internal/go.sum* ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o /app/bin/server ./cmd/server

# Expose port
EXPOSE 8080

# Run the application
CMD ["/app/bin/server"] 