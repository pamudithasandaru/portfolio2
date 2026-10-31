import { QueryClient } from '@tanstack/react-query';
import { queryDefs } from './queries';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Start the home-page requests before the components mount, and warm the
// other routes once the browser is idle so navigating to them is instant.
export const prefetchData = () => {
  queryClient.prefetchQuery(queryDefs.siteContent);
  queryClient.prefetchQuery(queryDefs.volunteering);
  queryClient.prefetchQuery(queryDefs.languageTools);

  const warmRoutes = () => {
    queryClient.prefetchQuery(queryDefs.projects);
    queryClient.prefetchQuery(queryDefs.certifications);
    queryClient.prefetchQuery(queryDefs.blogs);
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warmRoutes, { timeout: 3000 });
  } else {
    setTimeout(warmRoutes, 1500);
  }
};
