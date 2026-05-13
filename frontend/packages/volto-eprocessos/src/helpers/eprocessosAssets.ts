import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { addSubpathPrefix, isInternalURL } from '@plone/volto/helpers/Url/Url';

const getEnv = (): Record<string, string | undefined> => {
  const env = (globalThis as any)?.process?.env;
  return (env || {}) as Record<string, string | undefined>;
};

const stripApiPrefix = (url: string): string =>
  url.startsWith('/++api++')
    ? url.slice('/++api++'.length)
    : url.startsWith('++api++')
      ? url.slice('++api++'.length)
      : url;

export const stripEprocessosApiPrefix = stripApiPrefix;

const isAbsoluteUrl = (value: string): boolean =>
  value.startsWith('http://') || value.startsWith('https://');

const ensureLeadingSlash = (value: string): string =>
  value.startsWith('/') ? value : `/${value}`;

const normalizeBasePath = (value: string): string =>
  ensureLeadingSlash(value.trim()).replace(/\/+$/, '');

const getAtividadeLegislativaBasePath = (): string => {
  const env = getEnv();
  const raw = env.EPROCESSOS_ATIVIDADE_LEGISLATIVA_PATH;
  return normalizeBasePath(raw && raw.trim() ? raw : '/atividade-legislativa');
};

export type PathRewriteRule = {
  test: (path: string) => boolean;
  rewrite: (path: string) => string;
};

export const rewritePath = (
  path: string,
  rules?: PathRewriteRule[],
): string => {
  const list = Array.isArray(rules) ? rules : [];
  for (const rule of list) {
    if (rule.test(path)) return rule.rewrite(path);
  }
  return path;
};

const stripFacadePrefix = (path: string): string => path.replace(/^\/@@/, '/');

export const DEFAULT_EPROCESSOS_FACADE_REWRITES: PathRewriteRule[] = [
  {
    // Backend traversal returns `/@@legislaturas/{id}`, but the canonical
    // frontend route lives under `/atividade-legislativa/legislaturas/{id}`.
    test: (path) => path.startsWith('/legislaturas/'),
    rewrite: (path) => `${getAtividadeLegislativaBasePath()}${path}`,
  },
  {
    // Canonical routes for legislative activity live under `/atividade-legislativa/*`.
    test: (path) => path.startsWith('/materias/'),
    rewrite: (path) => `${getAtividadeLegislativaBasePath()}${path}`,
  },
];

/**
 * Resolve an URL that points to an internal Plone/Volto resource into an
 * app-relative path (respecting subpath) that can be used in links/requests.
 *
 * - External absolute URLs can be returned as-is when `allowExternal` is true.
 * - Internal absolute URLs are flattened.
 * - Relative URLs are flattened.
 */
export const resolveEprocessosAppPath = (
  raw?: string | null,
  options?: { allowExternal?: boolean },
): string | undefined => {
  if (!raw) return undefined;

  const allowExternal = options?.allowExternal ?? false;
  const sanitized = stripApiPrefix(raw);

  // Absolute URL.
  if (isAbsoluteUrl(sanitized)) {
    if (!isInternalURL(sanitized)) return allowExternal ? sanitized : undefined;
    const flattened = stripApiPrefix(flattenToAppURL(sanitized));
    return addSubpathPrefix(ensureLeadingSlash(flattened));
  }

  // If it already looks like an app path, avoid calling flattenToAppURL.
  const maybePath = sanitized.startsWith('/')
    ? sanitized
    : stripApiPrefix(flattenToAppURL(sanitized));
  return addSubpathPrefix(ensureLeadingSlash(maybePath));
};

/**
 * Normalize traversal/facade URLs (e.g. `/@@legislaturas/{id}`) into the
 * canonical frontend route.
 */
export const resolveEprocessosFacadePath = (
  raw?: string | null,
  options?: {
    allowExternal?: boolean;
    rewrites?: PathRewriteRule[];
    stripFacadePrefix?: boolean;
  },
): string | undefined => {
  const allowExternal = options?.allowExternal ?? true;
  const shouldStripFacadePrefix = options?.stripFacadePrefix ?? true;

  const appPath = resolveEprocessosAppPath(raw, { allowExternal });
  if (!appPath) return undefined;

  if (isAbsoluteUrl(appPath)) return appPath;

  const normalized = shouldStripFacadePrefix
    ? stripFacadePrefix(appPath)
    : appPath;
  const rules = options?.rewrites ?? DEFAULT_EPROCESSOS_FACADE_REWRITES;
  return rewritePath(normalized, rules);
};

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

  if (
    path.startsWith('/sapl_documentos/') ||
    path.startsWith('/sapl_documentos_download/') ||
    path.startsWith('/@@sapl_documentos_download') ||
    path.startsWith('/@@images/sapl_documentos_download/')
  ) {
    return `${getSapldocumentosBaseUrl()}${path}`;
  }

  return addSubpathPrefix(path);
};
