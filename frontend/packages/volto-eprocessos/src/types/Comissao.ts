/**
 * Type definitions for Comissão content.
 *
 * Matches the JSON output of the Comissao item serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/items/comissao.py`).
 *
 * Endpoints:
 *   GET /@@comissoes              → ComissoesResponse (list)
 *   GET /@@comissoes/{id}         → Comissao (detail)
 */

import type {
  BaseItem,
  ImageAttachment,
  ListResponse,
  Partido,
} from './common';

/**
 * A committee participant as it appears inside a Comissao detail's
 * `items` array.
 */
export interface ComissaoParticipante {
  '@id': string;
  '@type': 'ParticipanteComissao';
  id: string;
  title: string;
  description: string;
  cargo: string;
  mandato: string;
  ordem: number;
  url_foto: string;
  image: ImageAttachment[];
  partido: Partido[];
}

/**
 * A scheduled or held committee meeting.
 */
export interface ComissaoReuniao {
  '@id': string;
  '@type': 'ReuniaoComissao';
  id: string;
  title: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  [key: string]: unknown;
}

/**
 * A composition period of a committee.
 */
export interface ComissaoPeriodo {
  '@id'?: string;
  start: string;
  end: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * A summary entry in the Comissoes list response.
 */
export interface ComissaoSummary extends BaseItem {
  '@type': 'Comissao';
  tipo?: string;
}

/**
 * Full Comissao detail returned from `/@@comissoes/{id}`.
 */
export interface Comissao extends BaseItem {
  '@type': 'Comissao';
  tipo?: string;
  items?: ComissaoParticipante[];
  reunioes?: ComissaoReuniao[];
  periodos?: ComissaoPeriodo[];
}

/**
 * Response envelope for `/@@comissoes`.
 */
export type ComissoesResponse = ListResponse<ComissaoSummary>;
