export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const fetchJson = async (path, { signal } = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};
