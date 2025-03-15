package workflows

import (
	"context"
	"time"

	"github.com/Alan69/ayatest/internal/database"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// TestResult represents the result of a test
type TestResult struct {
	Score          int
	TotalQuestions int
	CorrectAnswers int
}

// AutoCompleteTestActivity automatically completes a test when the timer expires
func AutoCompleteTestActivity(ctx context.Context, completedTestID uuid.UUID) error {
	logger, _ := zap.NewProduction()
	sugar := logger.Sugar()
	sugar.Infow("Auto-completing test", "completedTestID", completedTestID)

	// Get the completed test
	var completedTest models.CompletedTest
	if err := database.DB.First(&completedTest, "id = ?", completedTestID).Error; err != nil {
		sugar.Errorw("Failed to get completed test", "error", err)
		return err
	}

	// Calculate the time spent
	var timeSpent int
	if completedTest.StartTestTime != nil {
		timeSpent = int(time.Since(*completedTest.StartTestTime).Minutes())
	}

	// Update the completed test
	completedTest.TimeSpent = &timeSpent

	// Save the completed test
	if err := database.DB.Save(&completedTest).Error; err != nil {
		sugar.Errorw("Failed to save completed test", "error", err)
		return err
	}

	sugar.Infow("Test auto-completed", "completedTestID", completedTestID)
	return nil
}

// SendTestReminderActivity sends a reminder to a user about their ongoing test
func SendTestReminderActivity(ctx context.Context, completedTestID, userID uuid.UUID) error {
	logger, _ := zap.NewProduction()
	sugar := logger.Sugar()
	sugar.Infow("Sending test reminder", "completedTestID", completedTestID, "userID", userID)

	// In a real implementation, this would send a notification to the user
	// For now, we'll just log it

	sugar.Infow("Test reminder sent", "completedTestID", completedTestID, "userID", userID)
	return nil
}

// CheckTestActivity checks a completed test and calculates the score
func CheckTestActivity(ctx context.Context, completedTestID uuid.UUID) (TestResult, error) {
	logger, _ := zap.NewProduction()
	sugar := logger.Sugar()
	sugar.Infow("Checking test", "completedTestID", completedTestID)

	// Get the completed test with its questions and selected options
	var completedTest models.CompletedTest
	if err := database.DB.Preload("Questions.SelectedOptions").Preload("Questions.Question.Options").First(&completedTest, "id = ?", completedTestID).Error; err != nil {
		sugar.Errorw("Failed to get completed test", "error", err)
		return TestResult{}, err
	}

	// Calculate the score
	totalQuestions := len(completedTest.Questions)
	correctAnswers := 0

	for _, completedQuestion := range completedTest.Questions {
		// Skip if the question is nil
		if completedQuestion.Question == nil {
			continue
		}

		// Get the correct options for the question
		var correctOptions []models.Option
		for _, option := range completedQuestion.Question.Options {
			if option.IsCorrect {
				correctOptions = append(correctOptions, option)
			}
		}

		// Check if the selected options match the correct options
		if len(completedQuestion.SelectedOptions) == len(correctOptions) {
			correct := true
			for _, selectedOption := range completedQuestion.SelectedOptions {
				found := false
				for _, correctOption := range correctOptions {
					if selectedOption.ID == correctOption.ID {
						found = true
						break
					}
				}
				if !found {
					correct = false
					break
				}
			}
			if correct {
				correctAnswers++
			}
		}
	}

	// Calculate the score as a percentage
	score := 0
	if totalQuestions > 0 {
		score = (correctAnswers * 100) / totalQuestions
	}

	result := TestResult{
		Score:          score,
		TotalQuestions: totalQuestions,
		CorrectAnswers: correctAnswers,
	}

	sugar.Infow("Test checked", "completedTestID", completedTestID, "score", score)
	return result, nil
}

// NotifyTestResultsActivity notifies a user of their test results
func NotifyTestResultsActivity(ctx context.Context, completedTestID uuid.UUID, result TestResult) error {
	logger, _ := zap.NewProduction()
	sugar := logger.Sugar()
	sugar.Infow("Notifying test results", "completedTestID", completedTestID, "score", result.Score)

	// In a real implementation, this would send a notification to the user
	// For now, we'll just log it

	sugar.Infow("Test results notified", "completedTestID", completedTestID, "score", result.Score)
	return nil
} 