package resolvers

import (
	"context"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
)

// GetTests returns all tests
func (r *queryResolver) Tests(ctx context.Context) ([]*models.Test, error) {
	var tests []*models.Test
	result := database.DB.Find(&tests)
	if result.Error != nil {
		return nil, result.Error
	}
	return tests, nil
}

// GetTest returns a test by ID
func (r *queryResolver) Test(ctx context.Context, id uuid.UUID) (*models.Test, error) {
	var test models.Test
	result := database.DB.First(&test, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &test, nil
}

// CreateTest creates a new test
func (r *mutationResolver) CreateTest(ctx context.Context, input models.TestInput) (*models.Test, error) {
	test := &models.Test{
		Title:             input.Title,
		NumberOfQuestions: input.NumberOfQuestions,
		Time:              input.Time,
		Score:             input.Score,
		ProductID:         input.ProductID,
		Grade:             input.Grade,
		IsRequired:        input.IsRequired != nil && *input.IsRequired,
	}

	result := database.DB.Create(test)
	if result.Error != nil {
		return nil, result.Error
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishTestCreated(test); err != nil {
		// Log the error but don't fail the request
		r.Logger.Error("Failed to publish test created event", "error", err)
	}

	return test, nil
}

// UpdateTest updates an existing test
func (r *mutationResolver) UpdateTest(ctx context.Context, id uuid.UUID, input models.TestInput) (*models.Test, error) {
	var test models.Test
	result := database.DB.First(&test, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}

	test.Title = input.Title
	if input.NumberOfQuestions != nil {
		test.NumberOfQuestions = input.NumberOfQuestions
	}
	if input.Time != nil {
		test.Time = input.Time
	}
	if input.Score != nil {
		test.Score = input.Score
	}
	if input.Grade != nil {
		test.Grade = input.Grade
	}
	if input.IsRequired != nil {
		test.IsRequired = *input.IsRequired
	}

	result = database.DB.Save(&test)
	if result.Error != nil {
		return nil, result.Error
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishTestUpdated(&test); err != nil {
		// Log the error but don't fail the request
		r.Logger.Error("Failed to publish test updated event", "error", err)
	}

	return &test, nil
}

// DeleteTest deletes a test
func (r *mutationResolver) DeleteTest(ctx context.Context, id uuid.UUID) (bool, error) {
	result := database.DB.Delete(&models.Test{}, "id = ?", id)
	if result.Error != nil {
		return false, result.Error
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishTestDeleted(id); err != nil {
		// Log the error but don't fail the request
		r.Logger.Error("Failed to publish test deleted event", "error", err)
	}

	return true, nil
}
