// Package graph provides GraphQL schema and executable schema
package graph

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/vektah/gqlparser/v2/ast"

	"github.com/Alan69/ayatest/internal/graph/resolvers"
)

// This is a simplified schema, in a real app you'd use code generation or a schema file
const schemaString = `
scalar Time
scalar UUID

type User {
  id: UUID!
  username: String!
  email: String!
}

input UserInput {
  username: String!
  email: String!
  password: String!
}

type Query {
  user(id: UUID!): User
}

type Mutation {
  createUser(input: UserInput!): User!
  login(username: String!, password: String!): String!
}
`

// NewSchema creates a new GraphQL schema
func NewSchema() *ast.Schema {
	schema, err := vektah.ParseSchema(&ast.Source{
		Input: schemaString,
		Name:  "schema.graphql",
	})
	if err != nil {
		panic(err)
	}
	return schema
}

// NewExecutableSchema creates a new executable schema
func NewExecutableSchema(config Config) graphql.ExecutableSchema {
	return &executableSchema{
		schema:    NewSchema(),
		resolvers: config.Resolvers,
	}
}

// Config configures the executable schema
type Config struct {
	Resolvers resolvers.ResolverRoot
}

// executableSchema implements graphql.ExecutableSchema
type executableSchema struct {
	schema    *ast.Schema
	resolvers resolvers.ResolverRoot
}

// Schema returns the GraphQL schema
func (e *executableSchema) Schema() *ast.Schema {
	return e.schema
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

// NewHandler creates a new GraphQL handler
func NewHandler(schema graphql.ExecutableSchema) *handler.Server {
	return handler.NewDefaultServer(schema)
}
