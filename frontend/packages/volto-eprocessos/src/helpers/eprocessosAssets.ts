import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { addSubpathPrefix, isInternalURL } from '@plone/volto/helpers/Url/Url';

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

type ParsedFacadeItem = {
  service: string;
  itemId: string;
};

const EP_ITEM_REGEX = /\/@@([^/]+)\/([^/?#]+)/;

const parseEprocessosItemUrl = (
  raw?: string | null,
): ParsedFacadeItem | null => {
  if (!raw) return null;
  const sanitized = stripApiPrefix(raw);
  const match = sanitized.match(EP_ITEM_REGEX);
  if (!match) return null;
  return { service: match[1], itemId: match[2] };
};

const normalizeServiceBasePath = (
  basePath: string,
  service: string,
): string => {
  const normalized = normalizeBasePath(basePath);
  const suffix = `/${service}`;

  const parts = normalized.split('/');
  const lastPart = parts[parts.length - 1];

  const prevPart = parts.length > 2 ? parts[parts.length - 2] : '';

  if (lastPart === service) {
    if (prevPart !== service) {
      return `${normalized}${suffix}`;
    }
    return normalized;
  }

  return `${normalized}${suffix}`;
};

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

  const maybePath = sanitized.startsWith('/')
    ? sanitized
    : stripApiPrefix(flattenToAppURL(sanitized));
  return addSubpathPrefix(ensureLeadingSlash(maybePath));
};

export type NavigationItem = {
  '@id'?: string;
  items?: NavigationItem[];
};

export const resolveServiceBasePathFromNavigation = (
  items: NavigationItem[] | undefined,
  service: string,
): string | undefined => {
  if (!Array.isArray(items) || !service) return undefined;

  const servicePattern = new RegExp(`/${service}(/|$)`);
  const stack = [...items];

  while (stack.length) {
    const item = stack.shift();
    const rawId = item?.['@id'];
    if (typeof rawId === 'string' && servicePattern.test(rawId)) {
      const appPath = resolveEprocessosAppPath(rawId, { allowExternal: false });
      if (appPath) return appPath.replace(/\/[^/]+$/, '');
    }
    if (Array.isArray(item?.items) && item?.items?.length) {
      stack.push(...item.items);
    }
  }

  return undefined;
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
  const allowExternal = options?.allowExternal ?? false;
  const shouldStripFacadePrefix = options?.stripFacadePrefix ?? true;

  const appPath = resolveEprocessosAppPath(raw, { allowExternal });
  if (!appPath) return undefined;

  if (isAbsoluteUrl(appPath)) return appPath;

  const normalized = shouldStripFacadePrefix
    ? stripFacadePrefix(appPath)
    : appPath;
  const rules = options?.rewrites ?? [];
  return rewritePath(normalized, rules);
};

export const resolveEprocessosVereadorPath = (
  raw?: string | null,
  options?: {
    basePath?: string;
    allowExternal?: boolean;
  },
): string | undefined => {
  const parsed = parseEprocessosItemUrl(raw);
  if (parsed?.service === 'vereadores') {
    const base = options?.basePath?.trim();
    if (base) {
      const facadePath = normalizeServiceBasePath(base, parsed.service);
      return `${facadePath}/${parsed.itemId}`;
    }
  }

  const fromFacade = resolveEprocessosFacadePath(raw, { allowExternal: false });
  if (fromFacade) return fromFacade;

  return resolveEprocessosAppPath(raw, {
    allowExternal: options?.allowExternal ?? false,
  });
};

/**
 * Resolve an asset URL that comes from e-Processos payloads.
 *
 * - External absolute URLs are kept.
 * - Internal absolute URLs are flattened to app paths.
 * - Relative URLs are treated as local paths.
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

  return addSubpathPrefix(path);
};
