import { createClient as createUrqlClient, fetchExchange } from '@urql/core';
import { makeOperation } from '@urql/core';
import { jwtDecode } from 'jwt-decode';

export const createClient = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/query';

  return createUrqlClient({
    url: API_URL,
    fetchOptions: () => {
      const token = localStorage.getItem('token');
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
    },
    exchanges: [
      fetchExchange,
    ],
  });
}; 