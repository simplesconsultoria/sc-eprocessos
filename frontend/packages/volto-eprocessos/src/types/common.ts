/**
 * Shared types used across e-Processos service responses.
 *
 * Mirrors the TypedDicts in
 * `backend/src/sc/eprocessos/client/types.py` and the wrapper fields
 * added by `BaseItemSerializer._process_data`.
 */

/**
 * Parent facade reference injected by `BaseItemSerializer._process_data`.
 */
export interface ParentRef {
  '@id': string;
  title: string;
}

/**
 * A file attachment (PDF, etc.) — `FileItem` in the backend.
 */
export interface FileAttachment {
  'content-type': string;
  download: string;
  filename: string;
  size: string;
}

/**
 * Image scale entry produced by `process_image_field`.
 */
export interface ImageScale {
  download: string;
  width: number;
  height: number;
}

/**
 * Image attachment with scales added by `process_image_field`.
 *
 * Note: e-Processos returns numeric `height`/`size`/`width` in some
 * payloads (legislaturas detail) and string-typed in others (vereador
 * detail). The serializer does not normalize these — the type accepts
 * both.
 */
export interface ImageAttachment {
  'content-type': string;
  download: string;
  filename: string;
  height: string | number;
  size: string | number;
  width: string | number;
  scales?: Record<string, ImageScale>;
}

/**
 * A political party reference.
 */
export interface Partido {
  title: string;
  token: string;
}

/**
 * Authorship of a legislative matter.
 */
export interface Authorship {
  description: string;
  firstAuthor: boolean;
  title: string;
}

/**
 * Standard fields injected by `BaseItemSerializer._process_data` on
 * every serialized e-Processos item.
 */
export interface BaseItem {
  '@id': string;
  '@type': string;
  id: string;
  title: string;
  description?: string;
  parent?: ParentRef;
  '@components'?: Record<string, unknown>;
}

/**
 * Standard list-response envelope returned by every facade serializer.
 */
export interface ListResponse<TItem> {
  '@id': string;
  '@type': string;
  description: string;
  items: TItem[];
}

/**
 * Shape of the ``form_config`` payload emitted by searchable facades
 * (see backend ``EProcessosSearchableFacade`` subclasses). Matches the
 * schema shape consumed by Volto's ``@plone/volto/components/manage/Form``.
 */
export interface FormConfigFieldset {
  id: string;
  title: string;
  fields: string[];
}

export interface FormConfig {
  title: string;
  fieldsets: FormConfigFieldset[];
  properties: Record<string, Record<string, unknown>>;
  required: string[];
}
