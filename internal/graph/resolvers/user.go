package resolvers

import (
	"context"
	"os"
	"time"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// User returns a user by ID
func (r *queryResolver) User(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	result := database.DB.First(&user, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// CreateUser creates a new user
func (r *mutationResolver) CreateUser(ctx context.Context, input models.UserInput) (*models.User, error) {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     models.RoleUser, // Default role is user
	}

	result := database.DB.Create(user)
	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}

// Login authenticates a user
func (r *mutationResolver) Login(ctx context.Context, username string, password string) (string, error) {
	var user models.User
	result := database.DB.Where("username = ?", username).First(&user)
	if result.Error != nil {
		r.Logger.Errorw("Login failed: user not found", "username", username, "error", result.Error)
		return "", result.Error
	}

	// Verify the password
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		r.Logger.Errorw("Login failed: invalid password", "username", username)
		return "", err
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":      user.ID.String(),
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
	})

	// Get JWT secret from environment variable
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default_jwt_secret_change_in_production" // Default secret for development
	}

	// Sign the token
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		r.Logger.Errorw("Failed to generate JWT token", "error", err)
		return "", err
	}

	r.Logger.Infow("User logged in successfully", "username", username)
	return tokenString, nil
}

// CreateAdmin creates a new admin user (only callable by existing admins)
func (r *mutationResolver) CreateAdmin(ctx context.Context, input models.UserInput) (*models.User, error) {
	// Check if the caller is an admin
	userID, ok := ctx.Value("userID").(string)
	if !ok {
		return nil, ErrUnauthorized
	}

	var caller models.User
	result := database.DB.First(&caller, "id = ?", userID)
	if result.Error != nil || caller.Role != models.RoleAdmin {
		return nil, ErrUnauthorized
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     models.RoleAdmin,
	}

	result = database.DB.Create(user)
	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}
