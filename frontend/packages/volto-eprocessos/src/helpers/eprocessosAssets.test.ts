import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import config from '@plone/volto/registry';

import { resolveEprocessosAssetUrl } from './eprocessosAssets';

const ORIGINAL_PUBLIC_URL = config.settings.publicURL;
const ORIGINAL_API_PATH = config.settings.apiPath;

describe('resolveEprocessosAssetUrl', () => {
  beforeEach(() => {
    config.settings.publicURL = 'http://localhost:3000';
    config.settings.apiPath = 'http://localhost:8080/Plone';
    delete (process.env as Record<string, string | undefined>)
      .EPROCESSOS_ASSETS_BASE_URL;
    delete (process.env as Record<string, string | undefined>)
      .EPROCESSOS_MOCK_PUBLIC_URL;
  });

  afterEach(() => {
    config.settings.publicURL = ORIGINAL_PUBLIC_URL;
    config.settings.apiPath = ORIGINAL_API_PATH;
  });

  describe('falsy input', () => {
    it('returns undefined for null', () => {
      expect(resolveEprocessosAssetUrl(null)).toBeUndefined();
    });
    it('returns undefined for empty string', () => {
      expect(resolveEprocessosAssetUrl('')).toBeUndefined();
    });
    it('returns undefined for undefined', () => {
      expect(resolveEprocessosAssetUrl(undefined)).toBeUndefined();
    });
  });

  // ---- direct mode (eprocessos.proxy_images=False) — absolute upstream URLs ----

  describe('absolute upstream URLs (proxy_images=False)', () => {
    it('keeps sapl_documentos absolute URLs verbatim', () => {
      const url =
        'https://e-processos.example.com/sapl_documentos/parlamentar/fotos/546914_foto';
      expect(resolveEprocessosAssetUrl(url)).toBe(url);
    });

    it('keeps sapl_documentos_download view URLs verbatim', () => {
      const url =
        'https://e-processos.example.com/@@sapl_documentos_download?path=parlamentar/fotos/546914_foto';
      expect(resolveEprocessosAssetUrl(url)).toBe(url);
    });

    it('keeps URLs whose host shares a domain suffix with publicURL', () => {
      // Regression guard for Volto's substring-based isInternalURL: a host
      // that contains publicURL as a fragment must still be treated as
      // upstream when the path is a sapl asset.
      config.settings.publicURL = 'https://camara.cidade.gov.br';
      const url =
        'https://e-processos.camara.cidade.gov.br/sapl_documentos/parlamentar/fotos/546914_foto';
      expect(resolveEprocessosAssetUrl(url)).toBe(url);
    });

    it('keeps external (non-sapl) absolute URLs unchanged', () => {
      const url = 'https://other-host.com/some/portrait.jpg';
      expect(resolveEprocessosAssetUrl(url)).toBe(url);
    });
  });

  // ---- proxy mode (eprocessos.proxy_images=True) — relative URLs ----

  describe('relative sapl paths (proxy_images=True)', () => {
    it('prefixes /sapl_documentos/... with the configured mock base', () => {
      process.env.EPROCESSOS_ASSETS_BASE_URL = 'http://localhost:8000';
      expect(
        resolveEprocessosAssetUrl(
          '/sapl_documentos/parlamentar/fotos/546914_foto',
        ),
      ).toBe(
        'http://localhost:8000/sapl_documentos/parlamentar/fotos/546914_foto',
      );
    });

    it('prefixes /@@images/sapl_documentos_download/... with the mock base', () => {
      process.env.EPROCESSOS_ASSETS_BASE_URL = 'http://localhost:8000';
      expect(
        resolveEprocessosAssetUrl(
          '/@@images/sapl_documentos_download/parlamentar/fotos/546914_foto',
        ),
      ).toBe(
        'http://localhost:8000/@@images/sapl_documentos_download/parlamentar/fotos/546914_foto',
      );
    });

    it('falls back to localhost:8000 when no env var is set', () => {
      expect(
        resolveEprocessosAssetUrl(
          '/sapl_documentos/parlamentar/fotos/546914_foto',
        ),
      ).toBe(
        'http://localhost:8000/sapl_documentos/parlamentar/fotos/546914_foto',
      );
    });

    it('trims a trailing slash from EPROCESSOS_ASSETS_BASE_URL', () => {
      process.env.EPROCESSOS_ASSETS_BASE_URL = 'http://localhost:8000/';
      expect(resolveEprocessosAssetUrl('/sapl_documentos/foto')).toBe(
        'http://localhost:8000/sapl_documentos/foto',
      );
    });
  });

  // ---- existing behaviors ----

  describe('++api++ prefix handling', () => {
    it('strips a leading /++api++ from absolute URLs before deciding', () => {
      const url =
        'https://e-processos.example.com/++api++/sapl_documentos/foto';
      expect(resolveEprocessosAssetUrl(url)).toBe(url);
    });

    it('strips /++api++ from relative paths', () => {
      expect(
        resolveEprocessosAssetUrl(
          '/++api++/sapl_documentos/parlamentar/fotos/foto',
        ),
      ).toBe('http://localhost:8000/sapl_documentos/parlamentar/fotos/foto');
    });
  });

  describe('non-sapl relative paths', () => {
    it('returns the path as-is (with subpath prefix) for arbitrary local paths', () => {
      // No subpath prefix configured → identity.
      expect(resolveEprocessosAssetUrl('/some/other/path')).toBe(
        '/some/other/path',
      );
    });
  });
});
