import { createClient, fetchExchange } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';
import { makeOperation } from '@urql/core';
import { jwtDecode } from 'jwt-decode';

export const createClient = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/query';

  return createClient({
    url: API_URL,
    exchanges: [
      authExchange({
        getAuth: async ({ authState }) => {
          if (!authState) {
            const token = localStorage.getItem('token');
            if (token) {
              try {
                const decoded = jwtDecode(token);
                const expiresAt = decoded.exp * 1000;
                
                if (Date.now() < expiresAt) {
                  return { token };
                } else {
                  localStorage.removeItem('token');
                  return null;
                }
              } catch (e) {
                localStorage.removeItem('token');
                return null;
              }
            }
            return null;
          }
          
          return authState;
        },
        addAuthToOperation: ({ authState, operation }) => {
          if (!authState || !authState.token) {
            return operation;
          }
          
          const fetchOptions =
            typeof operation.context.fetchOptions === 'function'
              ? operation.context.fetchOptions()
              : operation.context.fetchOptions || {};
          
          return makeOperation(operation.kind, operation, {
            ...operation.context,
            fetchOptions: {
              ...fetchOptions,
              headers: {
                ...fetchOptions.headers,
                Authorization: `Bearer ${authState.token}`,
              },
            },
          });
        },
        didAuthError: ({ error }) => {
          return error.graphQLErrors.some(
            e => e.extensions?.code === 'UNAUTHORIZED'
          );
        },
      }),
      fetchExchange,
    ],
  });
}; 