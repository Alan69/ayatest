package events

import (
	"encoding/json"

	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
	"go.uber.org/zap"
)

// Event types
const (
	EventProductCreated   = "product.created"
	EventProductUpdated   = "product.updated"
	EventProductDeleted   = "product.deleted"
	EventTestCreated      = "test.created"
	EventTestUpdated      = "test.updated"
	EventTestDeleted      = "test.deleted"
	EventTestStarted      = "test.started"
	EventQuestionAnswered = "question.answered"
	EventTestCompleted    = "test.completed"
)

// Publisher defines the interface for publishing events
type Publisher interface {
	PublishProductCreated(product *models.Product) error
	PublishProductUpdated(product *models.Product) error
	PublishProductDeleted(id uuid.UUID) error
	PublishTestCreated(test *models.Test) error
	PublishTestUpdated(test *models.Test) error
	PublishTestDeleted(id uuid.UUID) error
	PublishTestStarted(completedTest *models.CompletedTest) error
	PublishQuestionAnswered(completedQuestion *models.CompletedQuestion) error
	PublishTestCompleted(completedTest *models.CompletedTest) error
}

// NATSPublisher implements the Publisher interface using NATS
type NATSPublisher struct {
	nc     *nats.Conn
	logger *zap.SugaredLogger
}

// NewNATSPublisher creates a new NATS publisher
func NewNATSPublisher(nc *nats.Conn, logger *zap.SugaredLogger) Publisher {
	return &NATSPublisher{
		nc:     nc,
		logger: logger,
	}
}

// PublishProductCreated publishes a product created event
func (p *NATSPublisher) PublishProductCreated(product *models.Product) error {
	data, err := json.Marshal(product)
	if err != nil {
		return err
	}
	return p.nc.Publish(EventProductCreated, data)
}

// PublishProductUpdated publishes a product updated event
func (p *NATSPublisher) PublishProductUpdated(product *models.Product) error {
	data, err := json.Marshal(product)
	if err != nil {
		return err
	}
	return p.nc.Publish(EventProductUpdated, data)
}

// PublishProductDeleted publishes a product deleted event
func (p *NATSPublisher) PublishProductDeleted(id uuid.UUID) error {
	data, err := json.Marshal(map[string]string{"id": id.String()})
	if err != nil {
		return err
	}
	return p.nc.Publish(EventProductDeleted, data)
}

// PublishTestCreated publishes a test created event
func (p *NATSPublisher) PublishTestCreated(test *models.Test) error {
	data, err := json.Marshal(test)
	if err != nil {
		return err
	}
	return p.nc.Publish(EventTestCreated, data)
}

// PublishTestUpdated publishes a test updated event
func (p *NATSPublisher) PublishTestUpdated(test *models.Test) error {
	data, err := json.Marshal(test)
	if err != nil {
		return err
	}
	return p.nc.Publish(EventTestUpdated, data)
}

// PublishTestDeleted publishes a test deleted event
func (p *NATSPublisher) PublishTestDeleted(id uuid.UUID) error {
	data, err := json.Marshal(map[string]string{"id": id.String()})
	if err != nil {
		return err
	}
	return p.nc.Publish(EventTestDeleted, data)
}

// PublishTestStarted publishes a test started event
func (p *NATSPublisher) PublishTestStarted(completedTest *models.CompletedTest) error {
	data, err := json.Marshal(completedTest)
	if err != nil {
		return err
	}
	return p.nc.Publish(EventTestStarted, data)
}

// PublishQuestionAnswered publishes a question answered event
func (p *NATSPublisher) PublishQuestionAnswered(completedQuestion *models.CompletedQuestion) error {
	data, err := json.Marshal(completedQuestion)
	if err != nil {
		return err
	}
	return p.nc.Publish(EventQuestionAnswered, data)
}

// PublishTestCompleted publishes a test completed event
func (p *NATSPublisher) PublishTestCompleted(completedTest *models.CompletedTest) error {
	data, err := json.Marshal(completedTest)
	if err != nil {
		return err
	}
	return p.nc.Publish(EventTestCompleted, data)
}
