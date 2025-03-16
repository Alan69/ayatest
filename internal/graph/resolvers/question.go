package resolvers

import (
	"context"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
)

// Questions returns all questions for a test
func (r *queryResolver) Questions(ctx context.Context, testID uuid.UUID) ([]*models.Question, error) {
	var questions []*models.Question
	result := database.DB.Where("test_id = ?", testID).Preload("Options").Find(&questions)
	if result.Error != nil {
		return nil, result.Error
	}
	return questions, nil
}

// Question returns a question by ID
func (r *queryResolver) Question(ctx context.Context, id uuid.UUID) (*models.Question, error) {
	var question models.Question
	result := database.DB.Preload("Options").First(&question, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &question, nil
}

// CreateQuestion creates a new question
func (r *mutationResolver) CreateQuestion(ctx context.Context, input models.QuestionInput) (*models.Question, error) {
	question := &models.Question{
		TestID:       input.TestID,
		Text:         input.Text,
		Text2:        input.Text2,
		Text3:        input.Text3,
		ImgPath:      input.ImgPath,
		TaskType:     input.TaskType,
		Level:        input.Level,
		Status:       input.Status,
		Category:     input.Category,
		Subcategory:  input.Subcategory,
		Theme:        input.Theme,
		Subtheme:     input.Subtheme,
		Target:       input.Target,
		Source:       input.Source,
		SourceTextID: input.SourceTextID,
		DetailID:     input.DetailID,
		LngID:        input.LngID,
		LngTitle:     input.LngTitle,
		SubjectID:    input.SubjectID,
		SubjectTitle: input.SubjectTitle,
		ClassNumber:  input.ClassNumber,
	}

	result := database.DB.Create(question)
	if result.Error != nil {
		return nil, result.Error
	}

	return question, nil
}

// UpdateQuestion updates an existing question
func (r *mutationResolver) UpdateQuestion(ctx context.Context, id uuid.UUID, input models.QuestionInput) (*models.Question, error) {
	var question models.Question
	result := database.DB.First(&question, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}

	if input.Text != nil {
		question.Text = input.Text
	}
	if input.Text2 != nil {
		question.Text2 = input.Text2
	}
	if input.Text3 != nil {
		question.Text3 = input.Text3
	}
	if input.ImgPath != nil {
		question.ImgPath = input.ImgPath
	}
	if input.TaskType != nil {
		question.TaskType = input.TaskType
	}
	if input.Level != nil {
		question.Level = input.Level
	}
	if input.Status != nil {
		question.Status = input.Status
	}
	if input.Category != nil {
		question.Category = input.Category
	}
	if input.Subcategory != nil {
		question.Subcategory = input.Subcategory
	}
	if input.Theme != nil {
		question.Theme = input.Theme
	}
	if input.Subtheme != nil {
		question.Subtheme = input.Subtheme
	}
	if input.Target != nil {
		question.Target = input.Target
	}
	if input.Source != nil {
		question.Source = input.Source
	}
	if input.SourceTextID != nil {
		question.SourceTextID = input.SourceTextID
	}
	if input.DetailID != nil {
		question.DetailID = input.DetailID
	}
	if input.LngID != nil {
		question.LngID = input.LngID
	}
	if input.LngTitle != nil {
		question.LngTitle = input.LngTitle
	}
	if input.SubjectID != nil {
		question.SubjectID = input.SubjectID
	}
	if input.SubjectTitle != nil {
		question.SubjectTitle = input.SubjectTitle
	}
	if input.ClassNumber != nil {
		question.ClassNumber = input.ClassNumber
	}

	result = database.DB.Save(&question)
	if result.Error != nil {
		return nil, result.Error
	}

	return &question, nil
}

// DeleteQuestion deletes a question
func (r *mutationResolver) DeleteQuestion(ctx context.Context, id uuid.UUID) (bool, error) {
	result := database.DB.Delete(&models.Question{}, "id = ?", id)
	if result.Error != nil {
		return false, result.Error
	}

	return true, nil
}
