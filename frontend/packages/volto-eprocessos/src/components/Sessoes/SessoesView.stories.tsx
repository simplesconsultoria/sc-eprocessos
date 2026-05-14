import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type {
  FormConfig,
  SessaoSummary,
  Sessoes,
} from '@simplesconsultoria/volto-eprocessos/types';

import SessoesView from './SessoesView';

import sessoesList from '../../../../../../eprocessos_mock/data/sessoes/list.json';
import sessao1486 from '../../../../../../eprocessos_mock/data/sessoes/1486.json';
import sessao1492 from '../../../../../../eprocessos_mock/data/sessoes/1492.json';
import sessao1493 from '../../../../../../eprocessos_mock/data/sessoes/1493.json';

const withWrapper: Decorator = (Story: any) => (
  <Wrapper anonymous>
    <div style={{ width: 960, padding: 24 }}>
      <Story />
    </div>
  </Wrapper>
);

const choicesFrom = (entries: { id: number | string; title: string }[]) =>
  entries.map((entry) => [String(entry.id), entry.title]);

const filtros = (sessoesList as any).filtros;

const FORM_CONFIG: FormConfig = {
  title: 'Filtrar sessões',
  fieldsets: [{ id: 'default', title: 'default', fields: ['ano', 'tipo'] }],
  properties: {
    ano: {
      title: 'Ano',
      type: 'string',
      choices: choicesFrom(filtros.ano),
      default: '',
    },
    tipo: {
      title: 'Tipo',
      type: 'string',
      choices: choicesFrom(filtros.tipo),
      default: '',
    },
  },
  required: ['tipo', 'ano'],
};

const toSummary = (s: any): SessaoSummary => ({
  '@id': s['@id'],
  '@type': s['@type'],
  id: s.id,
  title: s.title,
  description: s.description,
  date: s.date,
  startTime: s.startTime,
  endTime: s.endTime,
  type: s.type,
  type_id: s.type_id,
});

const BASE: Sessoes = {
  '@id': '/sessoes',
  '@type': 'Sessoes',
  id: 'sessoes',
  title: 'Sessões Plenárias',
  description: 'Reuniões da Câmara',
  form_config: FORM_CONFIG,
};

const WITH_RESULTS: Sessoes = {
  ...BASE,
  items: [toSummary(sessao1486), toSummary(sessao1492), toSummary(sessao1493)],
};

const meta = {
  title: 'Public/Content/Sessoes/View',
  component: SessoesView,
  decorators: [withWrapper],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof SessoesView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FormOnly: Story = {
  name: 'Form only (no filters applied)',
  args: { content: BASE },
};

export const WithResults: Story = {
  name: 'With results (filters applied)',
  args: { content: WITH_RESULTS },
};
