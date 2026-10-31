import { useQuery } from '@tanstack/react-query';
import { fetchJson } from './client';

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
