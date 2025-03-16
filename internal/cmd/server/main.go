package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/events"
	"github.com/Alan69/ayatest/internal/graph/resolvers"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/Alan69/ayatest/internal/workflows"
	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
	"github.com/nats-io/nats.go"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
)

// GraphQLRequest represents a GraphQL request
type GraphQLRequest struct {
	Query         string                 `json:"query"`
	OperationName string                 `json:"operationName,omitempty"`
	Variables     map[string]interface{} `json:"variables,omitempty"`
}

// AuthMiddleware extracts the JWT token from the Authorization header and adds the user ID to the context
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			// No token, continue without authentication
			next(w, r)
			return
		}

		// Extract the token
		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		// Parse the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}

			// Get JWT secret from environment variable
			jwtSecret := os.Getenv("JWT_SECRET")
			if jwtSecret == "" {
				jwtSecret = "default_jwt_secret_change_in_production" // Default secret for development
			}

			return []byte(jwtSecret), nil
		})

		if err != nil {
			// Invalid token, continue without authentication
			next(w, r)
			return
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Add user ID to context
			userID, ok := claims["sub"].(string)
			if ok {
				ctx := context.WithValue(r.Context(), "userID", userID)
				r = r.WithContext(ctx)

				// Add user role to context
				if role, ok := claims["role"].(string); ok {
					ctx = context.WithValue(r.Context(), "userRole", role)
					r = r.WithContext(ctx)
				}
			}
		}

		// Continue with the request
		next(w, r)
	}
}

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

	// No need to manually initialize the resolver, it has methods to return the resolvers

	// Set up a simple GraphQL endpoint
	http.HandleFunc("/query", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		// Only handle POST requests
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// Read the request body
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			sugar.Errorw("Failed to read request body", "error", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		// Parse the GraphQL request
		var req GraphQLRequest
		if err := json.Unmarshal(body, &req); err != nil {
			sugar.Errorw("Failed to parse GraphQL request", "error", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Log the GraphQL query
		sugar.Infow("Received GraphQL query", "query", req.Query, "operationName", req.OperationName)

		// Check if this is a login or createUser mutation
		if req.OperationName == "Login" || (strings.Contains(req.Query, "mutation") && strings.Contains(req.Query, "login")) {
			// For login, use the real resolver
			result, err := resolver.Mutation().Login(r.Context(), req.Variables["username"].(string), req.Variables["password"].(string))
			if err != nil {
				sugar.Errorw("Login failed", "error", err)
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"errors": []map[string]interface{}{
						{
							"message": "Authentication failed",
						},
					},
				})
				return
			}

			response := map[string]interface{}{
				"data": map[string]interface{}{
					"login": result,
				},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
			return
		} else if req.OperationName == "CreateUser" || (strings.Contains(req.Query, "mutation") && strings.Contains(req.Query, "createUser")) {
			// For user creation, use the real resolver
			input := models.UserInput{
				Username: req.Variables["input"].(map[string]interface{})["username"].(string),
				Email:    req.Variables["input"].(map[string]interface{})["email"].(string),
				Password: req.Variables["input"].(map[string]interface{})["password"].(string),
			}

			result, err := resolver.Mutation().CreateUser(r.Context(), input)
			if err != nil {
				sugar.Errorw("User creation failed", "error", err)
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"errors": []map[string]interface{}{
						{
							"message": err.Error(),
						},
					},
				})
				return
			}

			response := map[string]interface{}{
				"data": map[string]interface{}{
					"createUser": map[string]interface{}{
						"id":       result.ID.String(),
						"username": result.Username,
						"email":    result.Email,
					},
				},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
			return
		}

		// For other queries, use the real resolvers
		// TODO: Implement GraphQL server with proper schema and resolvers
		// For now, return a mock response
		response := map[string]interface{}{
			"data": map[string]interface{}{
				"user": map[string]interface{}{
					"id":       "123e4567-e89b-12d3-a456-426614174000",
					"username": "testuser",
					"email":    "test@example.com",
				},
			},
		}

		// Return the response
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))

	// Set up GraphQL playground
	http.HandleFunc("/playground", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>GraphQL Playground</title>
			<meta charset="utf-8" />
			<meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui" />
			<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
			<script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
		</head>
		<body>
			<div id="root">
				<style>
					body {
						background-color: rgb(23, 42, 58);
						font-family: Open Sans, sans-serif;
						height: 90vh;
					}
					#root {
						height: 100%;
						width: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
					}
					.loading {
						font-size: 32px;
						font-weight: 200;
						color: rgba(255, 255, 255, .6);
						margin-left: 20px;
					}
					img {
						width: 78px;
						height: 78px;
					}
					.title {
						font-weight: 400;
					}
				</style>
				<img src='//cdn.jsdelivr.net/npm/graphql-playground-react/build/logo.png' alt=''>
				<div class="loading"> Loading
					<span class="title">GraphQL Playground</span>
				</div>
			</div>
			<script>window.addEventListener('load', function (event) {
				GraphQLPlayground.init(document.getElementById('root'), {
					endpoint: '/query'
				})
			})</script>
		</body>
		</html>
		`))
	})

	// Set up a simple health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Set up admin API endpoints
	http.HandleFunc("/api/admin/users", authMiddleware(func(w http.ResponseWriter, r *http.Request) {
		// Check if user is admin
		userRole, ok := r.Context().Value("userRole").(string)
		if !ok || userRole != string(models.RoleAdmin) {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		// Get all users
		var users []models.User
		result := database.DB.Find(&users)
		if result.Error != nil {
			sugar.Errorw("Failed to get users", "error", result.Error)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get users"})
			return
		}

		// Return users
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}))

	http.HandleFunc("/api/admin/products", authMiddleware(func(w http.ResponseWriter, r *http.Request) {
		// Check if user is admin
		userRole, ok := r.Context().Value("userRole").(string)
		if !ok || userRole != string(models.RoleAdmin) {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		// Get all products
		var products []models.Product
		result := database.DB.Find(&products)
		if result.Error != nil {
			sugar.Errorw("Failed to get products", "error", result.Error)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get products"})
			return
		}

		// Return products
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(products)
	}))

	http.HandleFunc("/api/admin/tests", authMiddleware(func(w http.ResponseWriter, r *http.Request) {
		// Check if user is admin
		userRole, ok := r.Context().Value("userRole").(string)
		if !ok || userRole != string(models.RoleAdmin) {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		// Get all tests
		var tests []models.Test
		result := database.DB.Preload("Product").Find(&tests)
		if result.Error != nil {
			sugar.Errorw("Failed to get tests", "error", result.Error)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to get tests"})
			return
		}

		// Return tests
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tests)
	}))

	// Set up login and register API endpoints
	http.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
		// Only handle POST requests
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// Read the request body
		var req struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			sugar.Errorw("Failed to parse login request", "error", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Call the login resolver
		token, err := resolver.Mutation().Login(r.Context(), req.Username, req.Password)
		if err != nil {
			sugar.Errorw("Login failed", "error", err)
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Authentication failed"})
			return
		}

		// Return the token
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"token": token})
	})

	http.HandleFunc("/api/register", func(w http.ResponseWriter, r *http.Request) {
		// Only handle POST requests
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		// Read the request body
		var req struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			sugar.Errorw("Failed to parse register request", "error", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Call the createUser resolver
		input := models.UserInput{
			Username: req.Username,
			Email:    req.Email,
			Password: req.Password,
		}
		user, err := resolver.Mutation().CreateUser(r.Context(), input)
		if err != nil {
			sugar.Errorw("User creation failed", "error", err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// Return success
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"user": map[string]string{
				"id":       user.ID.String(),
				"username": user.Username,
				"email":    user.Email,
			},
		})
	})

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

// corsMiddleware adds CORS headers to responses
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the next handler
		next(w, r)
	}
}
