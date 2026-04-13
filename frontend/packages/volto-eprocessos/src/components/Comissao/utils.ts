import type {
  ComissaoParticipante,
  ComissaoPeriodo,
  ComissaoReuniao,
} from '@simplesconsultoria/volto-eprocessos/types';

type ReunioesEnvelope = {
  items?: ComissaoReuniao[];
};

export const normalizeMeetings = (value: unknown): ComissaoReuniao[] => {
  if (Array.isArray(value)) return value as ComissaoReuniao[];
  if (value && typeof value === 'object') {
    const items = (value as ReunioesEnvelope).items;
    if (Array.isArray(items)) return items;
  }
  return [];
};

export const normalizePeriods = (
  value: unknown,
): Array<ComissaoPeriodo & Record<string, any>> => {
  if (Array.isArray(value)) return value as any;
  return [];
};

export const normalizeParticipants = (
  value: unknown,
): ComissaoParticipante[] => {
  if (Array.isArray(value)) return value as ComissaoParticipante[];
  return [];
};
