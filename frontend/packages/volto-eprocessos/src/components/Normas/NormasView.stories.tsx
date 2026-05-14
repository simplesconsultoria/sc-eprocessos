import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type {
  FormConfig,
  Normas,
  NormaSummary,
} from '@simplesconsultoria/volto-eprocessos/types';

import NormasView from './NormasView';

import normasList from '../../../../../../eprocessos_mock/data/normas/list.json';
import norma17666 from '../../../../../../eprocessos_mock/data/normas/17666.json';
import norma17667 from '../../../../../../eprocessos_mock/data/normas/17667.json';
import norma17668 from '../../../../../../eprocessos_mock/data/normas/17668.json';

const withWrapper: Decorator = (Story: any) => (
  <Wrapper anonymous>
    <div style={{ width: 960, padding: 24 }}>
      <Story />
    </div>
  </Wrapper>
);

const choicesFrom = (entries: { id: number | string; title: string }[]) =>
  entries.map((entry) => [String(entry.id), entry.title]);

const filtros = (normasList as any).filtros;

const FORM_CONFIG: FormConfig = {
  title: 'Filtrar normas',
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

const toSummary = (n: any): NormaSummary => ({
  '@id': n['@id'],
  '@type': n['@type'],
  id: n.id,
  title: n.title,
  description: n.description,
  data_apresentacao: n.data_norma,
});

const BASE: Normas = {
  '@id': '/normas',
  '@type': 'Normas',
  id: 'normas',
  title: 'Normas',
  description: 'Leis, resoluções e decretos',
  form_config: FORM_CONFIG,
};

const WITH_RESULTS: Normas = {
  ...BASE,
  items: [toSummary(norma17666), toSummary(norma17667), toSummary(norma17668)],
};

const meta = {
  title: 'Public/Content/Normas/View',
  component: NormasView,
  decorators: [withWrapper],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof NormasView>;

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
