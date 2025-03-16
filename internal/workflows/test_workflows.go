package workflows

import (
	"time"

	"github.com/google/uuid"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

// TestTaskQueue is the task queue for test workflows
const TestTaskQueue = "test-task-queue"

// TestTimerParams contains parameters for the test timer workflow
type TestTimerParams struct {
	CompletedTestID uuid.UUID
	UserID          uuid.UUID
	DurationMinutes int
}

// AutoCheckTestParams contains parameters for the auto-check test workflow
type AutoCheckTestParams struct {
	CompletedTestID uuid.UUID
}

// TestTimerWorkflow is a workflow that tracks the time for a test
func TestTimerWorkflow(ctx workflow.Context, params TestTimerParams) error {
	logger := workflow.GetLogger(ctx)
	logger.Info("Test timer workflow started", "completedTestID", params.CompletedTestID)

	// Set up a timer for the test duration
	timerDuration := time.Duration(params.DurationMinutes) * time.Minute
	timerCtx, cancelTimer := workflow.WithCancel(ctx)
	timer := workflow.NewTimer(timerCtx, timerDuration)

	// Set up a timer for sending reminders
	reminderInterval := 5 * time.Minute
	if timerDuration > 10*time.Minute {
		reminderInterval = timerDuration / 3
	}
	reminderCtx, cancelReminder := workflow.WithCancel(ctx)
	reminderTimer := workflow.NewTimer(reminderCtx, reminderInterval)

	// Set up a selector to wait for either the test to complete or the timer to expire
	selector := workflow.NewSelector(ctx)

	// Handle test completion signal
	var testCompleted bool
	selector.AddReceive(workflow.GetSignalChannel(ctx, "test-completed"), func(c workflow.ReceiveChannel, more bool) {
		c.Receive(ctx, &testCompleted)
		logger.Info("Test completed signal received", "completedTestID", params.CompletedTestID)
		cancelTimer()
		cancelReminder()
	})

	// Handle timer expiration
	selector.AddFuture(timer, func(f workflow.Future) {
		err := f.Get(ctx, nil)
		if err != nil {
			logger.Error("Timer error", "error", err)
			return
		}
		logger.Info("Test timer expired", "completedTestID", params.CompletedTestID)

		// Execute activity to auto-complete the test
		activityOptions := workflow.ActivityOptions{
			StartToCloseTimeout: 10 * time.Second,
			RetryPolicy: &temporal.RetryPolicy{
				InitialInterval:    time.Second,
				BackoffCoefficient: 2.0,
				MaximumInterval:    time.Minute,
				MaximumAttempts:    3,
			},
		}
		ctx = workflow.WithActivityOptions(ctx, activityOptions)
		err = workflow.ExecuteActivity(ctx, AutoCompleteTestActivity, params.CompletedTestID).Get(ctx, nil)
		if err != nil {
			logger.Error("Failed to auto-complete test", "error", err)
		}
	})

	// Handle reminder timer
	selector.AddFuture(reminderTimer, func(f workflow.Future) {
		err := f.Get(ctx, nil)
		if err != nil {
			logger.Error("Reminder timer error", "error", err)
			return
		}
		logger.Info("Sending test reminder", "completedTestID", params.CompletedTestID)

		// Execute activity to send a reminder
		activityOptions := workflow.ActivityOptions{
			StartToCloseTimeout: 10 * time.Second,
			RetryPolicy: &temporal.RetryPolicy{
				InitialInterval:    time.Second,
				BackoffCoefficient: 2.0,
				MaximumInterval:    time.Minute,
				MaximumAttempts:    3,
			},
		}
		ctx = workflow.WithActivityOptions(ctx, activityOptions)
		err = workflow.ExecuteActivity(ctx, SendTestReminderActivity, params.CompletedTestID, params.UserID).Get(ctx, nil)
		if err != nil {
			logger.Error("Failed to send test reminder", "error", err)
		}

		// Reset the reminder timer
		cancelReminder()
		reminderCtx, cancelReminder = workflow.WithCancel(ctx)
		reminderTimer = workflow.NewTimer(reminderCtx, reminderInterval)
		selector.AddFuture(reminderTimer, nil) // Re-add the timer to the selector
	})

	// Wait for either the test to complete or the timer to expire
	for {
		selector.Select(ctx)
		if testCompleted {
			break
		}
	}

	return nil
}

// AutoCheckTestWorkflow is a workflow that automatically checks a completed test
func AutoCheckTestWorkflow(ctx workflow.Context, params AutoCheckTestParams) error {
	logger := workflow.GetLogger(ctx)
	logger.Info("Auto-check test workflow started", "completedTestID", params.CompletedTestID)

	// Execute activity to check the test
	activityOptions := workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Second,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, activityOptions)
	var result TestResult
	err := workflow.ExecuteActivity(ctx, CheckTestActivity, params.CompletedTestID).Get(ctx, &result)
	if err != nil {
		logger.Error("Failed to check test", "error", err)
		return err
	}

	// Execute activity to notify the user of the results
	err = workflow.ExecuteActivity(ctx, NotifyTestResultsActivity, params.CompletedTestID, result).Get(ctx, nil)
	if err != nil {
		logger.Error("Failed to notify test results", "error", err)
		return err
	}

	return nil
}
