import { flattenToAppURL } from '@plone/volto/helpers';
import { addSubpathPrefix, isInternalURL } from '@plone/volto/helpers/Url/Url';

const getEnv = (): Record<string, string | undefined> => {
  const env = (globalThis as any)?.process?.env;
  return (env || {}) as Record<string, string | undefined>;
};

const stripApiPrefix = (url: string): string =>
  url.startsWith('/++api++') ? url.slice('/++api++'.length) : url;

const getSapldocumentosBaseUrl = (): string => {
  const env = getEnv();
  const explicit =
    env.EPROCESSOS_ASSETS_BASE_URL || env.EPROCESSOS_MOCK_PUBLIC_URL;
  const base = (explicit || 'http://localhost:8000').trim();
  return base.replace(/\/$/, '');
};

/**
 * Resolve an asset URL that comes from e-Processos payloads.
 *
 * - External absolute URLs are kept.
 * - Internal absolute URLs are flattened to app paths.
 * - Relative `/sapl_documentos/...` URLs are served by the local mock
 *   during development (port 8000) when running on localhost.
 */
export const resolveEprocessosAssetUrl = (
  raw?: string | null,
): string | undefined => {
  if (!raw) return undefined;

  const sanitized = stripApiPrefix(raw);

  // Absolute URL.
  if (sanitized.startsWith('http://') || sanitized.startsWith('https://')) {
    if (!isInternalURL(sanitized)) return sanitized;
    const flattened = stripApiPrefix(flattenToAppURL(sanitized));
    const path = flattened.startsWith('/') ? flattened : `/${flattened}`;
    return addSubpathPrefix(path);
  }

  const path = sanitized.startsWith('/') ? sanitized : `/${sanitized}`;

  // `/sapl_documentos/...` is served outside the Volto frontend.
  if (path.startsWith('/sapl_documentos/')) {
    return `${getSapldocumentosBaseUrl()}${path}`;
  }

  return addSubpathPrefix(path);
};
