import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJson } from './client';
import { mergeSiteContent } from '../content/siteDefaults';

const asArray = (data) => (Array.isArray(data) ? data : []);

export const queryDefs = {
  projects: {
    queryKey: ['project-categories'],
    queryFn: ({ signal }) => fetchJson('/api/project-categories', { signal }).then(asArray),
  },
  certifications: {
    queryKey: ['certification-categories'],
    queryFn: ({ signal }) => fetchJson('/api/certification-categories', { signal }).then(asArray),
  },
  volunteering: {
    queryKey: ['volunteering-experiences'],
    queryFn: ({ signal }) => fetchJson('/api/volunteering-experiences', { signal }).then(asArray),
  },
  siteContent: {
    queryKey: ['site-content'],
    queryFn: ({ signal }) => fetchJson('/api/site-content', { signal }),
  },
  blogs: {
    queryKey: ['blogs'],
    queryFn: ({ signal }) => fetchJson('/api/blogs', { signal }).then(asArray),
  },
  languageTools: {
    queryKey: ['language-tool-sections'],
    queryFn: ({ signal }) => fetchJson('/api/language-tool-sections', { signal }).then((data) => data || null),
  },
};

// Components keep their `loading` / `error` / `data` vocabulary.
const useApiQuery = (def, errorMessage) => {
  const { data, isPending, isError } = useQuery(def);
  return { data, loading: isPending, error: isError ? errorMessage : '' };
};

export const useProjectCategories = () =>
  useApiQuery(queryDefs.projects, 'Unable to load project categories right now.');

export const useCertificationCategories = () =>
  useApiQuery(queryDefs.certifications, 'Unable to load certifications right now.');

export const useVolunteeringExperiences = () =>
  useApiQuery(queryDefs.volunteering, 'Unable to load volunteering experiences right now.');

export const useLanguageToolSection = () =>
  useApiQuery(queryDefs.languageTools, 'Unable to load languages and tools right now.');

// Editable page text, merged over the built-in defaults so pages render instantly
export const useSiteContent = () => {
  const { data } = useQuery(queryDefs.siteContent);
  return useMemo(() => mergeSiteContent(data), [data]);
};

// ---- Blog posts ----

export const useBlogs = () => useQuery(queryDefs.blogs);

export const useBlogPost = (slug) =>
  useQuery({
    queryKey: ['blog-post', slug],
    queryFn: ({ signal }) => fetchJson(`/api/blogs/${encodeURIComponent(slug)}`, { signal }),
    retry: (count, error) => error.status !== 404 && count < 2,
  });

// ---- Blog feedback (ratings and comments) ----

export const blogKeys = {
  summary: ['blog-summary'],
  feedback: (slug, visitorId) => ['blog-feedback', slug, visitorId],
};

// Rating average and comment count for every post (blog list cards)
export const useBlogSummary = () =>
  useQuery({
    queryKey: blogKeys.summary,
    queryFn: ({ signal }) => fetchJson('/api/blog-feedback/summary', { signal }),
    staleTime: 60 * 1000,
  });

export const useBlogFeedback = (slug, visitorId) =>
  useQuery({
    queryKey: blogKeys.feedback(slug, visitorId),
    queryFn: ({ signal }) =>
      fetchJson(`/api/blog-feedback/${slug}?visitorId=${encodeURIComponent(visitorId)}`, { signal }),
    staleTime: 30 * 1000,
  });
