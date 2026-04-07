/**
 * Type definitions for Norma content.
 *
 * Matches the JSON output of the Norma item serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/items/norma.py`).
 *
 * Endpoints:
 *   GET /@@normas?ano={year}&tipo={tipo}   → NormasResponse (list)
 *   GET /@@normas/{id}                     → Norma (detail)
 */

import type { BaseItem, FileAttachment, ListResponse } from './common';

/**
 * Reference to a related materia inside a Norma detail response.
 */
export interface NormaMateriaRef {
  '@id': string;
  '@type': 'MateriaLegislativa';
  id: string;
  title: string;
  description: string;
  remoteUrl: string;
  autoria: NormaAutor[];
}

export interface NormaAutor {
  '@id': string;
  '@type': 'Autor';
  id: string;
  title: string;
  primeiro_autor: boolean;
}

/**
 * A summary entry in the Normas list response.
 */
export interface NormaSummary extends BaseItem {
  '@type': 'Norma';
  data_apresentacao?: string;
}

/**
 * Full Norma detail returned from `/@@normas/{id}`.
 */
export interface Norma extends BaseItem {
  '@type': 'Norma';
  data_norma?: string;
  data_publicacao?: string;
  status?: string;
  veiculo_publicacao?: string;
  file?: FileAttachment[];
  anexos?: FileAttachment[];
  texto_compilado?: FileAttachment[];
  normas_vinculadas?: NormaSummary[];
  materia?: NormaMateriaRef[];
}

/**
 * Response envelope for `/@@normas`.
 */
export type NormasResponse = ListResponse<NormaSummary>;
