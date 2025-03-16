package resolvers

import (
	"context"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
)

// GetProducts returns all products
func (r *queryResolver) Products(ctx context.Context) ([]*models.Product, error) {
	var products []*models.Product
	result := database.DB.Find(&products)
	if result.Error != nil {
		return nil, result.Error
	}
	return products, nil
}

// GetProduct returns a product by ID
func (r *queryResolver) Product(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	var product models.Product
	result := database.DB.First(&product, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &product, nil
}

// CreateProduct creates a new product
func (r *mutationResolver) CreateProduct(ctx context.Context, input models.ProductInput) (*models.Product, error) {
	product := &models.Product{
		Title:        input.Title,
		Description:  input.Description,
		Sum:          input.Sum,
		Score:        input.Score,
		Time:         input.Time,
		SubjectLimit: input.SubjectLimit,
		ProductType:  input.ProductType,
	}

	result := database.DB.Create(product)
	if result.Error != nil {
		return nil, result.Error
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishProductCreated(product); err != nil {
		// Log the error but don't fail the request
		r.Logger.Error("Failed to publish product created event", "error", err)
	}

	return product, nil
}

// UpdateProduct updates an existing product
func (r *mutationResolver) UpdateProduct(ctx context.Context, id uuid.UUID, input models.ProductInput) (*models.Product, error) {
	var product models.Product
	result := database.DB.First(&product, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}

	product.Title = input.Title
	if input.Description != nil {
		product.Description = input.Description
	}
	if input.Sum != nil {
		product.Sum = input.Sum
	}
	if input.Score != nil {
		product.Score = input.Score
	}
	if input.Time != nil {
		product.Time = input.Time
	}
	if input.SubjectLimit != nil {
		product.SubjectLimit = input.SubjectLimit
	}
	if input.ProductType != "" {
		product.ProductType = input.ProductType
	}

	result = database.DB.Save(&product)
	if result.Error != nil {
		return nil, result.Error
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishProductUpdated(&product); err != nil {
		// Log the error but don't fail the request
		r.Logger.Error("Failed to publish product updated event", "error", err)
	}

	return &product, nil
}

// DeleteProduct deletes a product
func (r *mutationResolver) DeleteProduct(ctx context.Context, id uuid.UUID) (bool, error) {
	result := database.DB.Delete(&models.Product{}, "id = ?", id)
	if result.Error != nil {
		return false, result.Error
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishProductDeleted(id); err != nil {
		// Log the error but don't fail the request
		r.Logger.Error("Failed to publish product deleted event", "error", err)
	}

	return true, nil
}
