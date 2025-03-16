package resolvers

import (
	"context"

	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
)

// TestStarted subscribes to test started events
func (r *subscriptionResolver) TestStarted(ctx context.Context, userID uuid.UUID) (<-chan *models.CompletedTest, error) {
	r.Logger.Info("Subscribing to test started events", "userID", userID)

	// Create a channel for test started events
	testStartedChan := make(chan *models.CompletedTest, 1)

	// Set up subscription cleanup when context is cancelled
	go func() {
		<-ctx.Done()
		close(testStartedChan)
		r.Logger.Info("Subscription to test started events closed", "userID", userID)
	}()

	return testStartedChan, nil
}

// QuestionAnswered subscribes to question answered events
func (r *subscriptionResolver) QuestionAnswered(ctx context.Context, completedTestID uuid.UUID) (<-chan *models.CompletedQuestion, error) {
	r.Logger.Info("Subscribing to question answered events", "completedTestID", completedTestID)

	// Create a channel for question answered events
	questionAnsweredChan := make(chan *models.CompletedQuestion, 1)

	// Set up subscription cleanup when context is cancelled
	go func() {
		<-ctx.Done()
		close(questionAnsweredChan)
		r.Logger.Info("Subscription to question answered events closed", "completedTestID", completedTestID)
	}()

	return questionAnsweredChan, nil
}

// TestCompleted subscribes to test completed events
func (r *subscriptionResolver) TestCompleted(ctx context.Context, userID uuid.UUID) (<-chan *models.CompletedTest, error) {
	r.Logger.Info("Subscribing to test completed events", "userID", userID)

	// Create a channel for test completed events
	testCompletedChan := make(chan *models.CompletedTest, 1)

	// Set up subscription cleanup when context is cancelled
	go func() {
		<-ctx.Done()
		close(testCompletedChan)
		r.Logger.Info("Subscription to test completed events closed", "userID", userID)
	}()

	return testCompletedChan, nil
}
