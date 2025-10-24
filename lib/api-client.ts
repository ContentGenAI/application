import { supabase } from './supabase';

/**
 * Makes an authenticated API request
 * Automatically adds Authorization header with current session token
 */
export async function apiClient(url: string, options: RequestInit = {}) {
  // Get current session token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // Merge headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if we have a token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Convenience methods
 */
export const api = {
  get: (url: string) => apiClient(url, { method: 'GET' }),
  
  post: (url: string, data: any) =>
    apiClient(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: (url: string, data: any) =>
    apiClient(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (url: string) => apiClient(url, { method: 'DELETE' }),
};


