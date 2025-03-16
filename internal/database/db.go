package database

import (
	"fmt"
	"log"
	"os"

	"github.com/Alan69/ayatest/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the database connection
var DB *gorm.DB

// Connect establishes a connection to the database
func Connect() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to database")
}

// Migrate runs database migrations
func Migrate() {
	err := DB.AutoMigrate(
		&models.Product{},
		&models.Test{},
		&models.Source{},
		&models.Question{},
		&models.Option{},
		&models.User{},
		&models.CompletedTest{},
		&models.CompletedQuestion{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed")
}
