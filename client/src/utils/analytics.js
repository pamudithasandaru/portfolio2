import { apiBaseUrl } from '../api/client';
import { getVisitorId } from './visitor';

export const ADMIN_TOKEN_KEY = 'adminToken';

const isSignedInAsAdmin = () => {
  try {
    return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
  } catch {
    return false;
  }
};

const externalReferrer = () => {
  try {
    const url = new URL(document.referrer);
    return url.origin === window.location.origin ? '' : url.hostname;
  } catch {
    return '';
  }
};

// Anonymous page-view counter. Skipped in development and while you are signed in to /admin,
// so your own visits do not inflate the numbers. Failures are ignored on purpose.
export const trackPageView = (path) => {
  if (import.meta.env.DEV || isSignedInAsAdmin()) {
    return;
  }

  fetch(`${apiBaseUrl}/api/analytics/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, visitorId: getVisitorId(), referrer: externalReferrer() }),
    keepalive: true,
  }).catch(() => {});
};
