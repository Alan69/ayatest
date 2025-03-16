package resolvers

import (
	"context"
	"errors"

	"github.com/Alan69/ayatest/internal/events"
	"github.com/Alan69/ayatest/internal/models"
	"github.com/google/uuid"
	"go.temporal.io/sdk/client"
	"go.uber.org/zap"
)

// Common errors
var (
	ErrUnauthorized = errors.New("unauthorized")
)

// ResolverRoot is the interface for the root resolver
type ResolverRoot interface {
	Query() QueryResolver
	Mutation() MutationResolver
	Subscription() SubscriptionResolver
}

// Resolver is the root resolver
type Resolver struct {
	Logger         *zap.SugaredLogger
	EventPublisher events.Publisher
	TemporalClient client.Client
}

// Query returns the query resolver
func (r *Resolver) Query() QueryResolver {
	// We're not actually returning an implementation yet, just nil to compile
	return nil
}

// Mutation returns the mutation resolver
func (r *Resolver) Mutation() MutationResolver {
	// We're not actually returning an implementation yet, just nil to compile
	return nil
}

// Subscription returns the subscription resolver
func (r *Resolver) Subscription() SubscriptionResolver {
	// We're not actually returning an implementation yet, just nil to compile
	return nil
}

type queryResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }

// QueryResolver is the resolver for the Query type
type QueryResolver interface {
	// Define only methods we have implementations for
	Products(ctx context.Context) ([]*models.Product, error)
	Product(ctx context.Context, id uuid.UUID) (*models.Product, error)
	Tests(ctx context.Context) ([]*models.Test, error)
	Test(ctx context.Context, id uuid.UUID) (*models.Test, error)
	Questions(ctx context.Context, testID uuid.UUID) ([]*models.Question, error)
	Question(ctx context.Context, id uuid.UUID) (*models.Question, error)
	CompletedTests(ctx context.Context, userID uuid.UUID) ([]*models.CompletedTest, error)
	CompletedTest(ctx context.Context, id uuid.UUID) (*models.CompletedTest, error)
	User(ctx context.Context, id uuid.UUID) (*models.User, error)
}

// MutationResolver is the resolver for the Mutation type
type MutationResolver interface {
	// Define only methods we have implementations for
	CreateProduct(ctx context.Context, input models.ProductInput) (*models.Product, error)
	UpdateProduct(ctx context.Context, id uuid.UUID, input models.ProductInput) (*models.Product, error)
	DeleteProduct(ctx context.Context, id uuid.UUID) (bool, error)
	CreateTest(ctx context.Context, input models.TestInput) (*models.Test, error)
	UpdateTest(ctx context.Context, id uuid.UUID, input models.TestInput) (*models.Test, error)
	DeleteTest(ctx context.Context, id uuid.UUID) (bool, error)
	CreateQuestion(ctx context.Context, input models.QuestionInput) (*models.Question, error)
	UpdateQuestion(ctx context.Context, id uuid.UUID, input models.QuestionInput) (*models.Question, error)
	DeleteQuestion(ctx context.Context, id uuid.UUID) (bool, error)
	CreateOption(ctx context.Context, input models.OptionInput) (*models.Option, error)
	UpdateOption(ctx context.Context, id uuid.UUID, input models.OptionInput) (*models.Option, error)
	DeleteOption(ctx context.Context, id uuid.UUID) (bool, error)
	CreateUser(ctx context.Context, input models.UserInput) (*models.User, error)
	Login(ctx context.Context, username string, password string) (string, error)
	StartTest(ctx context.Context, input models.StartTestInput) (*models.CompletedTest, error)
	AnswerQuestion(ctx context.Context, input models.AnswerQuestionInput) (*models.CompletedQuestion, error)
	CompleteTest(ctx context.Context, input models.CompleteTestInput) (*models.CompletedTest, error)
	CreateSource(ctx context.Context, input models.SourceInput) (*models.Source, error)
	UpdateSource(ctx context.Context, id uuid.UUID, input models.SourceInput) (*models.Source, error)
	DeleteSource(ctx context.Context, id uuid.UUID) (bool, error)
}

// SubscriptionResolver is the resolver for the Subscription type
type SubscriptionResolver interface {
	// Define only methods we have implementations for
	TestStarted(ctx context.Context, userID uuid.UUID) (<-chan *models.CompletedTest, error)
	QuestionAnswered(ctx context.Context, completedTestID uuid.UUID) (<-chan *models.CompletedQuestion, error)
	TestCompleted(ctx context.Context, userID uuid.UUID) (<-chan *models.CompletedTest, error)
}
