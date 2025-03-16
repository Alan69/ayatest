FROM golang:1.20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the seed binary
RUN go build -o /seed ./cmd/seed

# Run the seed binary
CMD ["/seed"] 