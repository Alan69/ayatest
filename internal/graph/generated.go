// Package graph provides GraphQL schema and executable schema
package graph

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/Alan69/ayatest/internal/graph/resolvers"
)

// NewExecutableSchema creates a new executable schema
func NewExecutableSchema(config Config) graphql.ExecutableSchema {
	return &executableSchema{
		resolvers: config.Resolvers,
	}
}

// Config configures the executable schema
type Config struct {
	Resolvers resolvers.ResolverRoot
}

// executableSchema implements graphql.ExecutableSchema
type executableSchema struct {
	resolvers resolvers.ResolverRoot
}

// Schema returns the GraphQL schema
func (e *executableSchema) Schema() string {
	// This is a simplified schema, in a real app you'd use code generation or a schema file
	return `
	type Query {
		_dummy: String
	}
	
	type Mutation {
		_dummy: String
	}
	
	type Subscription {
		_dummy: String
	}
	`
}

// Complexity returns the complexity function
func (e *executableSchema) Complexity(typeName, fieldName string, childComplexity int, args map[string]interface{}) (int, bool) {
	return 0, false
}

// Exec executes a GraphQL operation
func (e *executableSchema) Exec(ctx context.Context) graphql.ResponseHandler {
	return func(ctx context.Context) *graphql.Response {
		return &graphql.Response{
			Data: []byte(`{"data":{}}`),
		}
	}
}
