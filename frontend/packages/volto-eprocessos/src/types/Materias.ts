/**
 * Type definitions for Materias (facade) content.
 *
 * Matches the JSON output of the Materias facade serializer in the backend
 * (`backend/src/sc/eprocessos/serializers/facade.py`), invoked when
 * filter params are present in the querystring.
 *
 * Endpoints:
 *   GET /materias                             → Materias (form-only)
 *   GET /materias?ano={year}&tipo={tipo}      → Materias (with items)
 */

import type { BaseItem, FormConfig } from './common';
import type { MateriaSummary } from './Materia';

export interface Materias extends BaseItem {
  '@type': 'Materias';
  form_config: FormConfig;
  items?: MateriaSummary[];
}
