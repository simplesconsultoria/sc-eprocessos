/**
 * Type definitions for Vereador content.
 *
 * Matches the JSON output of `SerializeVereadorItemToJson` in the backend
 * (`backend/src/sc/eprocessos/serializers/items/vereador.py`).
 *
 * The serializer transforms raw e-Processos API data by:
 *  - Rewriting `@id` URLs to the local facade
 *  - Unescaping the `biografia` HTML
 *  - Promoting `description` → `fullname` and computing `description`
 *    from the current party filiation
 *  - Processing the `image` field through the local `@@images` proxy
 */

/**
 * Parent facade reference injected by `BaseItemSerializer._process_data`.
 */
export interface VereadorParent {
  '@id': string;
  title: string;
}

/**
 * A single entry from the `image` array. Mirrors e-Processos raw shape
 * plus the `scales` dict added by `process_image_field`.
 */
export interface VereadorImageScale {
  download: string;
  width: number;
  height: number;
}

export interface VereadorImage {
  'content-type': string;
  download: string;
  filename: string;
  height: string;
  size: string;
  width: string;
  scales: Record<string, VereadorImageScale>;
}

/**
 * A party affiliation entry from `filiacoes`.
 */
export interface Filiacao {
  title: string;
  token: string;
  data_filiacao: string;
  data_desfiliacao: string;
  filiacao_atual: boolean;
}

/**
 * A political mandate entry from `mandatos`.
 */
export interface Mandato {
  '@id': string;
  '@type': 'Mandato';
  id: number;
  start: string;
  end: string;
  natureza: string;
  votos: string;
}

/**
 * A committee participation entry from `comissoes`.
 */
export interface ParticipacaoComissao {
  '@id': string;
  '@type': 'ParticipanteComissao';
  id: string;
  comissao: string;
  description: string;
  title: string;
  mandato: string;
  start: string;
  end: string;
}

/**
 * An executive board participation entry from `mesas`.
 */
export interface ParticipacaoMesa {
  '@id': string;
  '@type': string;
  id: string;
  title: string;
  description?: string;
  cargo?: string;
  start: string;
  end: string;
}

/**
 * The full Vereador content as returned by the REST API.
 *
 * Shape produced by `SerializeVereadorItemToJson` after all
 * `_transform_*` methods and `expandable_elements` have run.
 */
export interface Vereador {
  '@id': string;
  '@type': 'Vereador';
  id: string;
  title: string;

  // From _transform_description: original `description` becomes `fullname`
  // and `description` holds the current party token (e.g. "PP").
  fullname: string;
  description: string;

  // From _transform_biografia: HTML-unescaped biography
  biografia: string;

  // Councilor identifiers
  dic_vereador: string;
  cod_autor: string;

  // Contact info
  email: string;
  telefone_gabinete: string;

  // Personal
  birthday: string;

  // From _transform_image
  image: VereadorImage[];
  image_field: string;
  image_scales: Record<string, VereadorImage[]>;
  url_foto: string;

  // Nested collections
  filiacoes: Filiacao[];
  mandatos: Mandato[];
  comissoes: ParticipacaoComissao[];
  mesas: ParticipacaoMesa[];

  // Parent facade reference
  parent: VereadorParent;

  // Standard plone.restapi expansion bucket (breadcrumbs, navigation, etc.)
  '@components'?: Record<string, unknown>;
}
