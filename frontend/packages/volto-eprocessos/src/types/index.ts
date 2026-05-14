// Shared / cross-service types
export type {
  Authorship,
  BaseItem,
  FileAttachment,
  FormConfig,
  FormConfigFieldset,
  ImageAttachment,
  ImageScale,
  ListResponse,
  ParentRef,
  Partido,
} from './common';

// Vereadores
export type {
  Vereador,
  VereadorParent,
  VereadorImage,
  VereadorImageScale,
  Filiacao,
  Mandato,
  ParticipacaoComissao,
  ParticipacaoMesa,
} from './Vereador';

// Normas
export type {
  Norma,
  NormaSummary,
  NormasResponse,
  NormaMateriaRef,
  NormaAutor,
} from './Norma';
export type { Normas } from './Normas';

// Materias
export type {
  Materia,
  MateriaSummary,
  MateriasResponse,
  MateriaProcessing,
  MateriaVoteResult,
} from './Materia';
export type { Materias } from './Materias';

// Legislaturas
export type {
  Legislatura,
  LegislaturaSummary,
  LegislaturasResponse,
  LegislaturaVereadorRef,
} from './Legislatura';

// Mesas
export type {
  Mesa,
  MesaSummary,
  MesasResponse,
  MesaParticipante,
} from './Mesa';

// Comissoes
export type {
  Comissao,
  ComissaoSummary,
  ComissoesResponse,
  ComissaoParticipante,
  ComissaoReuniao,
  ComissaoPeriodo,
} from './Comissao';

// Sessoes
export type {
  Sessao,
  SessaoSummary,
  SessoesResponse,
  SessaoPresenca,
  SessaoVotacao,
  PresencaItem,
  VotacaoItem,
  VotacaoVoto,
} from './Sessao';
export type { Sessoes } from './Sessoes';
