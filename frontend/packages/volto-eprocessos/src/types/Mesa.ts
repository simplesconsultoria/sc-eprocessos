/**
 * Type definitions for Mesa Diretora content.
 *
 * Matches the JSON output of the Mesa item serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/items/mesa.py`).
 *
 * Endpoints:
 *   GET /@@mesas              → MesasResponse (list)
 *   GET /@@mesas/{id}         → Mesa (detail)
 */

import type {
  BaseItem,
  ImageAttachment,
  ListResponse,
  Partido,
} from './common';

/**
 * A board member as it appears inside a Mesa detail's `items` array.
 */
export interface MesaParticipante {
  '@id': string;
  '@type': 'ParticipanteMesa';
  id: string;
  title: string;
  description: string;
  cargo: string;
  url_foto: string;
  image: ImageAttachment[];
  partido: Partido[];
}

/**
 * A summary entry in the Mesas list response.
 */
export interface MesaSummary extends BaseItem {
  '@type': 'Mesa';
  legislatura?: string;
  legislatura_id?: string;
  start?: string;
  end?: string;
  atual?: boolean;
}

/**
 * Full Mesa detail returned from `/@@mesas/{id}`.
 */
export interface Mesa extends BaseItem {
  '@type': 'Mesa';
  legislatura?: string;
  legislatura_id?: string;
  start?: string;
  end?: string;
  atual?: boolean;
  items?: MesaParticipante[];
}

/**
 * Response envelope for `/@@mesas`.
 */
export type MesasResponse = ListResponse<MesaSummary>;
