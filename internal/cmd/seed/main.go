package main

import (
	"log"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to the database
	database.Connect()
	database.Migrate()

	// Create admin user if it doesn't exist
	var count int64
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count == 0 {
		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash password: %v", err)
		}

		// Create admin user
		admin := &models.User{
			Username: "admin",
			Email:    "admin@example.com",
			Password: string(hashedPassword),
			Role:     models.RoleAdmin,
		}

		result := database.DB.Create(admin)
		if result.Error != nil {
			log.Fatalf("Failed to create admin user: %v", result.Error)
		}

		log.Println("Admin user created successfully")
	} else {
		log.Println("Admin user already exists")
	}

	// Create test user if it doesn't exist
	database.DB.Model(&models.User{}).Where("username = ?", "test").Count(&count)
	if count == 0 {
		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash password: %v", err)
		}

		// Create test user
		testUser := &models.User{
			Username: "test",
			Email:    "test@example.com",
			Password: string(hashedPassword),
			Role:     models.RoleUser,
		}

		result := database.DB.Create(testUser)
		if result.Error != nil {
			log.Fatalf("Failed to create test user: %v", result.Error)
		}

		log.Println("Test user created successfully")
	} else {
		log.Println("Test user already exists")
	}

	log.Println("Seed completed successfully")
}
