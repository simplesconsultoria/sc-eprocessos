/**
 * Type definitions for Normas (facade) content.
 *
 * Matches the JSON output of the Normas facade serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/facade.py`), invoked when
 * filter params are present in the querystring.
 *
 * Endpoints:
 *   GET /normas                              → Normas (form-only)
 *   GET /normas?ano={year}&tipo={tipo}       → Normas (with items)
 */

import type { BaseItem, FormConfig } from './common';
import type { NormaSummary } from './Norma';

export interface Normas extends BaseItem {
  '@type': 'Normas';
  form_config: FormConfig;
  items?: NormaSummary[];
}
