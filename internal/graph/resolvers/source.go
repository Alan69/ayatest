package resolvers

import (
	"context"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
)

// CreateSource creates a new source
func (r *mutationResolver) CreateSource(ctx context.Context, input models.SourceInput) (*models.Source, error) {
	source := &models.Source{
		Text: input.Text,
	}

	result := database.DB.Create(source)
	if result.Error != nil {
		return nil, result.Error
	}

	return source, nil
}

// UpdateSource updates an existing source
func (r *mutationResolver) UpdateSource(ctx context.Context, id uuid.UUID, input models.SourceInput) (*models.Source, error) {
	var source models.Source
	result := database.DB.First(&source, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}

	source.Text = input.Text

	result = database.DB.Save(&source)
	if result.Error != nil {
		return nil, result.Error
	}

	return &source, nil
}

// DeleteSource deletes a source
func (r *mutationResolver) DeleteSource(ctx context.Context, id uuid.UUID) (bool, error) {
	result := database.DB.Delete(&models.Source{}, "id = ?", id)
	if result.Error != nil {
		return false, result.Error
	}

	return true, nil
}
