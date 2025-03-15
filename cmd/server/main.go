package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/events"
	"github.com/Alan69/ayatest/internal/graph"
	"github.com/Alan69/ayatest/internal/graph/resolvers"
	"github.com/Alan69/ayatest/internal/workflows"
	"github.com/joho/godotenv"
	"github.com/nats-io/nats.go"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to create logger: %v", err)
	}
	sugar := logger.Sugar()

	// Connect to the database
	database.Connect()
	database.Migrate()

	// Connect to NATS
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = nats.DefaultURL
	}
	nc, err := nats.Connect(natsURL)
	if err != nil {
		sugar.Fatalw("Failed to connect to NATS", "error", err)
	}
	defer nc.Close()
	sugar.Infow("Connected to NATS", "url", natsURL)

	// Create event publisher
	publisher := events.NewNATSPublisher(nc, sugar)

	// Connect to Temporal
	temporalURL := os.Getenv("TEMPORAL_URL")
	if temporalURL == "" {
		temporalURL = "localhost:7233"
	}
	temporalClient, err := client.NewClient(client.Options{
		HostPort: temporalURL,
	})
	if err != nil {
		sugar.Fatalw("Failed to create Temporal client", "error", err)
	}
	defer temporalClient.Close()
	sugar.Infow("Connected to Temporal", "url", temporalURL)

	// Start Temporal worker
	worker := workflows.NewWorker(temporalClient, sugar)
	err = worker.Start()
	if err != nil {
		sugar.Fatalw("Failed to start Temporal worker", "error", err)
	}
	defer worker.Stop()

	// Create resolver
	resolver := &resolvers.Resolver{
		Logger:         sugar,
		EventPublisher: publisher,
		TemporalClient: temporalClient,
	}

	// Create GraphQL server
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	// Set up HTTP server
	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", srv)

	// Get port from environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	sugar.Infow("Starting server", "port", port)
	server := &http.Server{
		Addr:         ":" + port,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	if err := server.ListenAndServe(); err != nil {
		sugar.Fatalw("Failed to start server", "error", err)
	}
} 