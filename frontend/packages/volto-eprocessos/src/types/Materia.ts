/**
 * Type definitions for Matéria Legislativa content.
 *
 * Matches the JSON output of the Materia item serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/items/materia.py`).
 *
 * Endpoints:
 *   GET /@@materias?ano={year}&tipo={tipo}   → MateriasResponse (list)
 *   GET /@@materias/{id}                     → Materia (detail)
 */

import type {
  Authorship,
  BaseItem,
  FileAttachment,
  ListResponse,
} from './common';

/**
 * A processing/tramitação step in a matter's history.
 */
export interface MateriaProcessing {
  date: string;
  title: string;
  description: string;
  sourceUnit: string;
  destinationUnit: string;
  file: FileAttachment[];
  last: boolean;
}

/**
 * Vote tally on a matter (`voteResult`).
 */
export interface MateriaVoteResult {
  date: string;
  result: string;
  yes: number;
  no: number;
  abstention: number;
  [key: string]: unknown;
}

/**
 * A summary entry in the Materias list response.
 */
export interface MateriaSummary extends BaseItem {
  '@type': 'Materia';
  date?: string;
  remoteUrl?: string;
  authorship?: Authorship[];
  file?: FileAttachment[];
}

/**
 * Full Materia detail returned from `/@@materias/{id}`.
 */
export interface Materia extends BaseItem {
  '@type': 'Materia';
  date?: string;
  remoteUrl?: string;
  inProgress?: boolean;
  processingRegime?: string;
  processingRegime_id?: string;
  quorum?: string;
  quorum_id?: string;
  authorship?: Authorship[];
  file?: FileAttachment[];
  accessoryDocument?: FileAttachment[];
  amendment?: unknown[];
  attached?: unknown[];
  substitute?: unknown[];
  committeeOpinion?: unknown[];
  processing?: MateriaProcessing[];
  voteResult?: MateriaVoteResult[];
}

/**
 * Response envelope for `/@@materias`.
 */
export type MateriasResponse = ListResponse<MateriaSummary>;
