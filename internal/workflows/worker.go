package workflows

import (
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"go.uber.org/zap"
)

// Worker represents a Temporal worker
type Worker struct {
	client client.Client
	worker worker.Worker
	logger *zap.SugaredLogger
}

// NewWorker creates a new Temporal worker
func NewWorker(c client.Client, logger *zap.SugaredLogger) *Worker {
	return &Worker{
		client: c,
		logger: logger,
	}
}

// Start starts the worker
func (w *Worker) Start() error {
	w.logger.Info("Starting Temporal worker")

	// Create a worker
	w.worker = worker.New(w.client, TestTaskQueue, worker.Options{})

	// Register workflows
	w.worker.RegisterWorkflow(TestTimerWorkflow)
	w.worker.RegisterWorkflow(AutoCheckTestWorkflow)

	// Register activities
	w.worker.RegisterActivity(AutoCompleteTestActivity)
	w.worker.RegisterActivity(SendTestReminderActivity)
	w.worker.RegisterActivity(CheckTestActivity)
	w.worker.RegisterActivity(NotifyTestResultsActivity)

	// Start the worker
	err := w.worker.Start()
	if err != nil {
		w.logger.Errorw("Failed to start worker", "error", err)
		return err
	}

	w.logger.Info("Temporal worker started")
	return nil
}

// Stop stops the worker
func (w *Worker) Stop() {
	if w.worker != nil {
		w.worker.Stop()
		w.logger.Info("Temporal worker stopped")
	}
} 