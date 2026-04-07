/**
 * Type definitions for Sessão Plenária content.
 *
 * Matches the JSON output of the Sessao item serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/items/sessao.py`).
 *
 * Endpoints:
 *   GET /@@sessoes/tipo/{tipo}/ano/{ano}      → SessoesResponse (list)
 *   GET /@@sessoes/id/{id}                    → Sessao (detail)
 *   GET /@@presenca_sessao/sessao_plenaria/{id}  → SessaoPresenca (expander)
 *   GET /@@votacao_sessao/sessao_plenaria/{id}   → SessaoVotacao (expander)
 *
 * The detail response also includes `@id_presenca` and `@id_votacao`
 * pointers that the backend `SessoesService.get` follows when expanders
 * are requested, mounting the result under `presenca` / `votacao`.
 */

import type { BaseItem, FileAttachment, ListResponse } from './common';

/**
 * Attendance record for a single councilor in a session.
 */
export interface PresencaItem {
  '@id'?: string;
  '@type'?: string;
  id?: string;
  title: string;
  presente?: boolean;
  justificativa?: string;
  [key: string]: unknown;
}

/**
 * Aggregate attendance data — payload of `@@presenca_sessao`.
 */
export interface SessaoPresenca {
  '@id'?: string;
  '@type'?: string;
  items: PresencaItem[];
  [key: string]: unknown;
}

/**
 * A single councilor's vote in a votação.
 */
export interface VotacaoVoto {
  title: string;
  voto: string;
  [key: string]: unknown;
}

/**
 * One voting block within a session (typically one per matter).
 */
export interface VotacaoItem {
  '@id'?: string;
  '@type'?: string;
  id?: string;
  title: string;
  description?: string;
  resultado?: string;
  votos?: VotacaoVoto[];
  [key: string]: unknown;
}

/**
 * Aggregate voting data — payload of `@@votacao_sessao`.
 */
export interface SessaoVotacao {
  '@id'?: string;
  '@type'?: string;
  items: VotacaoItem[];
  [key: string]: unknown;
}

/**
 * A summary entry in the Sessoes list response.
 */
export interface SessaoSummary extends BaseItem {
  '@type': 'SessaoPlenaria';
  '@id_presenca'?: string;
  '@id_votacao'?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  type_id?: number;
  ata?: FileAttachment[];
  pauta?: FileAttachment[];
}

/**
 * Full Sessao detail returned from `/@@sessoes/id/{id}`.
 *
 * `presenca` and `votacao` are populated by the backend client when
 * expanders are requested in `SessoesService.get(item_id, expanders=...)`.
 */
export interface Sessao extends BaseItem {
  '@type': 'SessaoPlenaria';
  '@id_presenca'?: string;
  '@id_votacao'?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  type_id?: number;
  ata?: FileAttachment[];
  pauta?: FileAttachment[];
  presenca?: SessaoPresenca;
  votacao?: SessaoVotacao;
}

/**
 * Response envelope for `/@@sessoes/tipo/{tipo}/ano/{ano}`.
 */
export type SessoesResponse = ListResponse<SessaoSummary>;
