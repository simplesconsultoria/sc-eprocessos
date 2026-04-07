/**
 * Type definitions for Legislatura content.
 *
 * Matches the JSON output of the Legislatura item serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/items/legislatura.py`).
 *
 * Endpoints:
 *   GET /@@legislaturas              → LegislaturasResponse (list)
 *   GET /@@legislaturas/{id}         → Legislatura (detail)
 */

import type {
  BaseItem,
  ImageAttachment,
  ListResponse,
  Partido,
} from './common';

/**
 * A councilor entry as it appears inside a Legislatura's `items` array.
 *
 * Note: this is the *legislatura-context* shape — leaner than the
 * standalone Vereador detail. Each entry includes mandate type, votes,
 * and the basic identifier/photo data.
 */
export interface LegislaturaVereadorRef {
  '@id': string;
  '@type': 'Vereador';
  id: string;
  cod_autor: string;
  title: string;
  description: string;
  url_foto: string;
  image: ImageAttachment[];
  partido: Partido[];
  mandato: string;
  votos: string;
}

/**
 * A summary entry in the Legislaturas list response.
 */
export interface LegislaturaSummary extends BaseItem {
  '@type': 'Legislatura';
  atual: boolean;
}

/**
 * Full Legislatura detail returned from `/@@legislaturas/{id}`.
 */
export interface Legislatura extends BaseItem {
  '@type': 'Legislatura';
  data_eleicao?: string;
  start?: string;
  end?: string;
  items?: LegislaturaVereadorRef[];
}

/**
 * Response envelope for `/@@legislaturas`.
 */
export type LegislaturasResponse = ListResponse<LegislaturaSummary>;
