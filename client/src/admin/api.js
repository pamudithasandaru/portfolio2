import { apiBaseUrl } from '../api/client';
import { ADMIN_TOKEN_KEY } from '../utils/analytics';

export const getToken = () => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // storage unavailable: you will have to sign in again after a refresh
  }
};

// JSON (or FormData with `form`) request carrying the admin token.
// A rejected token signs you out so the login screen shows up.
export const adminFetch = async (path, { method = 'GET', body, form } = {}) => {
  const headers = {};
  const token = getToken();
  let payload;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { method, headers, body: payload });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // empty or non-JSON body
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event('admin-unauthorized'));
    }
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
};

// Large photos are shrunk in the browser first (max 1920px wide, WebP) so uploads stay small and fast.
const shrinkImage = (file, maxWidth = 1920) =>
  new Promise((resolve) => {
    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      resolve(file);
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const smaller = blob && blob.size < file.size;
          resolve(
            smaller ? new File([blob], `${file.name.replace(/\.\w+$/, '')}.webp`, { type: 'image/webp' }) : file
          );
        },
        'image/webp',
        0.86
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    image.src = objectUrl;
  });

export const uploadImage = async (file) => {
  const form = new FormData();
  form.append('file', await shrinkImage(file));
  return adminFetch('/api/media', { method: 'POST', form });
};

export const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

export const toSlug = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const formatBytes = (bytes) =>
  bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
