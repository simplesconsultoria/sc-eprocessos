/**
 * Type definitions for Sessões content.
 *
 * Matches the JSON output of the Sessoes item serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/sessoes.py`).
 *
 * Endpoints:
 *   GET /@@sessoes               → Sessoes
 *
 */

import type { BaseItem, FormConfig } from './common';
import type { SessaoSummary } from './Sessao';

export interface Sessoes extends BaseItem {
  '@type': 'Sessoes';
  form_config: FormConfig;
  items?: SessaoSummary[];
}
