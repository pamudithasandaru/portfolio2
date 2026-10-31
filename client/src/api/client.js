export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const fetchJson = async (path, { signal } = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal });

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

// POST JSON. Errors carry the server's `message` so forms can show it to the visitor.
export const postJson = async (path, body) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // non-JSON error body
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload;
};
