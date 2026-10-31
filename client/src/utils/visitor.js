const ID_KEY = 'visitorId';
const NAME_KEY = 'commenterName';

const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage unavailable (private mode): the value just won't persist
    }
  },
};

const randomId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

// Anonymous id so a visitor can change (not repeat) their rating on a post
export const getVisitorId = () => {
  let id = safeStorage.get(ID_KEY);
  if (!id) {
    id = randomId();
    safeStorage.set(ID_KEY, id);
  }
  return id;
};

export const getSavedName = () => safeStorage.get(NAME_KEY) || '';
export const saveName = (name) => safeStorage.set(NAME_KEY, name);

export const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const timeAgo = (value) => {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return formatter.format(Math.round(seconds / size), unit);
    }
  }
  return 'just now';
};
