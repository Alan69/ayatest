package resolvers

import (
	"context"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
)

// CreateOption creates a new option
func (r *mutationResolver) CreateOption(ctx context.Context, input models.OptionInput) (*models.Option, error) {
	option := &models.Option{
		QuestionID: input.QuestionID,
		Text:       input.Text,
		ImgPath:    input.ImgPath,
		IsCorrect:  input.IsCorrect,
	}

	result := database.DB.Create(option)
	if result.Error != nil {
		return nil, result.Error
	}

	return option, nil
}

// UpdateOption updates an existing option
func (r *mutationResolver) UpdateOption(ctx context.Context, id uuid.UUID, input models.OptionInput) (*models.Option, error) {
	var option models.Option
	result := database.DB.First(&option, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}

	option.Text = input.Text
	if input.ImgPath != nil {
		option.ImgPath = input.ImgPath
	}
	option.IsCorrect = input.IsCorrect

	result = database.DB.Save(&option)
	if result.Error != nil {
		return nil, result.Error
	}

	return &option, nil
}

// DeleteOption deletes an option
func (r *mutationResolver) DeleteOption(ctx context.Context, id uuid.UUID) (bool, error) {
	result := database.DB.Delete(&models.Option{}, "id = ?", id)
	if result.Error != nil {
		return false, result.Error
	}

	return true, nil
}
