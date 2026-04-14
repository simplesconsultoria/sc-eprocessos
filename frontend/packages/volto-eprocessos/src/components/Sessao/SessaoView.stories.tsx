import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type { Sessao } from '@simplesconsultoria/volto-eprocessos/types';
import SessaoView from './SessaoView';

import sessaoOrdinaria from '../../../../../../eprocessos_mock/data/sessoes/1663.json';
import sessaoExtra from '../../../../../../eprocessos_mock/data/sessoes/1669.json';

const withWrapper: Decorator = (Story) => {
  const themeStyle = {
    '--theme-color': '#ffffff',
    '--theme-foreground-color': '#1b1c1d',
    '--theme-high-contrast-color': '#e0e0e0',
    '--theme-top-high-contrast-foreground-color': '#1b1c1d',
    '--theme-top-low-contrast-foreground-color': '#585858',
    '--link-foreground-color': '#1b1c1d',
  } as React.CSSProperties;

  return (
    <Wrapper anonymous>
      <div style={{ width: 960, padding: 24, ...themeStyle }}>
        <Story />
      </div>
    </Wrapper>
  );
};

const ORDINARIA_BASE = {
  ...(sessaoOrdinaria as any),
  '@id': '/atividade-legislativa/sessoes/1663',
  '@type': 'SessaoPlenaria',
} as Sessao;

const EXTRA_BASE = {
  ...(sessaoExtra as any),
  '@id': '/atividade-legislativa/sessoes/1669',
  '@type': 'SessaoPlenaria',
} as Sessao;

const PRESENCA_FULL = {
  '@id': '/atividade-legislativa/sessoes/1663/presenca',
  '@type': 'presencaSessao',
  chamadaRegimental: [
    {
      presentes_qtde: '20',
      ausentes_qtde: '3',
      justificados_qtde: '1',
      presentes: ['Vereador A', 'Vereador B'],
      ausentes: ['Vereador X'],
      justificados: ['Vereador Y'],
    },
  ],
  ordemDia: [
    {
      presentes_qtde: '19',
      ausentes_qtde: '4',
      justificados_qtde: '1',
      presentes: ['Vereador A', 'Vereador B'],
      ausentes: ['Vereador X', 'Vereador Z'],
      justificados: ['Vereador Y'],
    },
  ],
};

const VOTACAO_FULL = {
  '@id': '/atividade-legislativa/sessoes/1663/votacao',
  '@type': 'votacaoNominal',
  title: 'Lista de votação nominal',
  items: [
    {
      quorum: 'Maioria simples',
      tipo_votacao: 'Simbólica',
      turno: '1ª Discussão',
      apuracao: [{ resultado: 'Aprovado em 1ª Discussão' }],
      votos: [
        {
          favoravel: ['Vereador A', 'Vereador B'],
          contrario: ['Vereador X'],
          abstencao: [],
          ausente: ['Vereador Z'],
          presidencia: [],
        },
      ],
    },
  ],
};

const ORDINARIA_FULL = {
  ...ORDINARIA_BASE,
  presenca: PRESENCA_FULL as any,
  votacao: VOTACAO_FULL as any,
} as Sessao;

const EXTRA_WITHOUT_VOTACAO = {
  ...EXTRA_BASE,
  '@id': '',
  presenca: PRESENCA_FULL as any,
  votacao: undefined,
} as Sessao;

const EMPTY_ATTACHMENTS = {
  ...ORDINARIA_BASE,
  '@id': '',
  ata: [],
  pauta: [],
  presenca: PRESENCA_FULL as any,
} as Sessao;

const meta = {
  title: 'Public/Content/Sessao',
  component: SessaoView,
  decorators: [withWrapper],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof SessaoView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OrdinariaFull: Story = {
  args: {
    content: ORDINARIA_FULL,
  },
};

export const ExtraordinariaWithoutVotacao: Story = {
  args: {
    content: EXTRA_WITHOUT_VOTACAO,
  },
};

export const EmptyAtaPauta: Story = {
  args: {
    content: EMPTY_ATTACHMENTS,
  },
};
