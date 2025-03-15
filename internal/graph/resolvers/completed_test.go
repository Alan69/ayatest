package resolvers

import (
	"context"
	"time"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/Alan69/ayatest/internal/workflows"
	"github.com/google/uuid"
	"go.temporal.io/sdk/client"
)

// GetCompletedTests returns all completed tests for a user
func (r *queryResolver) CompletedTests(ctx context.Context, userID uuid.UUID) ([]*models.CompletedTest, error) {
	var completedTests []*models.CompletedTest
	result := database.DB.Where("user_id = ?", userID).Find(&completedTests)
	if result.Error != nil {
		return nil, result.Error
	}
	return completedTests, nil
}

// GetCompletedTest returns a completed test by ID
func (r *queryResolver) CompletedTest(ctx context.Context, id uuid.UUID) (*models.CompletedTest, error) {
	var completedTest models.CompletedTest
	result := database.DB.First(&completedTest, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &completedTest, nil
}

// StartTest starts a new test for a user
func (r *mutationResolver) StartTest(ctx context.Context, input models.StartTestInput) (*models.CompletedTest, error) {
	// Create a new completed test
	now := time.Now()
	completedTest := &models.CompletedTest{
		UserID:        input.UserID,
		ProductID:     input.ProductID,
		StartTestTime: &now,
	}

	// Start a transaction
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	// Create the completed test
	if err := tx.Create(completedTest).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Add the tests to the completed test
	for _, testID := range input.TestIDs {
		if err := tx.Model(completedTest).Association("Tests").Append(&models.Test{ID: testID}); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Start the Temporal workflow for test time tracking
	workflowOptions := client.StartWorkflowOptions{
		ID:        "test-timer-" + completedTest.ID.String(),
		TaskQueue: workflows.TestTaskQueue,
	}

	// Get the maximum time from all tests
	var maxTime int = 0
	var tests []*models.Test
	if err := database.DB.Where("id IN ?", input.TestIDs).Find(&tests).Error; err != nil {
		return nil, err
	}
	for _, test := range tests {
		if test.Time != nil && *test.Time > maxTime {
			maxTime = *test.Time
		}
	}

	// Default to 45 minutes if no time is specified
	if maxTime == 0 {
		maxTime = 45
	}

	// Start the workflow
	_, err := r.TemporalClient.ExecuteWorkflow(
		context.Background(),
		workflowOptions,
		workflows.TestTimerWorkflow,
		workflows.TestTimerParams{
			CompletedTestID: completedTest.ID,
			UserID:          input.UserID,
			DurationMinutes: maxTime,
		},
	)
	if err != nil {
		r.Logger.Error("Failed to start test timer workflow", "error", err)
		// Don't fail the request, just log the error
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishTestStarted(completedTest); err != nil {
		r.Logger.Error("Failed to publish test started event", "error", err)
	}

	return completedTest, nil
}

// AnswerQuestion records a user's answer to a question
func (r *mutationResolver) AnswerQuestion(ctx context.Context, input models.AnswerQuestionInput) (*models.CompletedQuestion, error) {
	// Create a new completed question
	completedQuestion := &models.CompletedQuestion{
		CompletedTestID: input.CompletedTestID,
		TestID:          input.TestID,
		QuestionID:      &input.QuestionID,
	}

	// Start a transaction
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	// Create the completed question
	if err := tx.Create(completedQuestion).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Add the selected options to the completed question
	for _, optionID := range input.SelectedOptionIDs {
		if err := tx.Model(completedQuestion).Association("SelectedOptions").Append(&models.Option{ID: optionID}); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishQuestionAnswered(completedQuestion); err != nil {
		r.Logger.Error("Failed to publish question answered event", "error", err)
	}

	return completedQuestion, nil
}

// CompleteTest completes a test
func (r *mutationResolver) CompleteTest(ctx context.Context, input models.CompleteTestInput) (*models.CompletedTest, error) {
	// Get the completed test
	var completedTest models.CompletedTest
	if err := database.DB.First(&completedTest, "id = ?", input.CompletedTestID).Error; err != nil {
		return nil, err
	}

	// Update the time spent
	completedTest.TimeSpent = &input.TimeSpent

	// Save the completed test
	if err := database.DB.Save(&completedTest).Error; err != nil {
		return nil, err
	}

	// Start the auto-check workflow
	workflowOptions := client.StartWorkflowOptions{
		ID:        "test-autocheck-" + completedTest.ID.String(),
		TaskQueue: workflows.TestTaskQueue,
	}

	// Start the workflow
	_, err := r.TemporalClient.ExecuteWorkflow(
		context.Background(),
		workflowOptions,
		workflows.AutoCheckTestWorkflow,
		workflows.AutoCheckTestParams{
			CompletedTestID: completedTest.ID,
		},
	)
	if err != nil {
		r.Logger.Error("Failed to start auto-check workflow", "error", err)
		// Don't fail the request, just log the error
	}

	// Publish event to NATS
	if err := r.EventPublisher.PublishTestCompleted(&completedTest); err != nil {
		r.Logger.Error("Failed to publish test completed event", "error", err)
	}

	return &completedTest, nil
} 