/**
 * API service for making requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchData<T>(
  endpoint: string, 
  params?: Record<string, string>,
  fetchOptions?: RequestInit
): Promise<T> {
  let url = `${API_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
