import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type {
  FormConfig,
  Materias,
  MateriaSummary,
} from '@simplesconsultoria/volto-eprocessos/types';

import MateriasView from './MateriasView';

import materiasList from '../../../../../../eprocessos_mock/data/materias/list.json';
import materia204461 from '../../../../../../eprocessos_mock/data/materias/204461.json';
import materia204462 from '../../../../../../eprocessos_mock/data/materias/204462.json';
import materia204463 from '../../../../../../eprocessos_mock/data/materias/204463.json';

const withWrapper: Decorator = (Story: any) => (
  <Wrapper anonymous>
    <div style={{ width: 960, padding: 24 }}>
      <Story />
    </div>
  </Wrapper>
);

const choicesFrom = (entries: { id: number | string; title: string }[]) =>
  entries.map((entry) => [String(entry.id), entry.title]);

const filtros = (materiasList as any).filtros;

const FORM_CONFIG: FormConfig = {
  title: 'Filtrar matérias',
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

const toSummary = (m: any): MateriaSummary => ({
  '@id': m['@id'],
  '@type': m['@type'],
  id: m.id,
  title: m.title,
  description: m.description,
  date: m.date,
  authorship: m.authorship,
});

const BASE: Materias = {
  '@id': '/materias',
  '@type': 'Materias',
  id: 'materias',
  title: 'Matérias Legislativas',
  description: 'Projetos de lei, requerimentos e indicações',
  form_config: FORM_CONFIG,
};

const WITH_RESULTS: Materias = {
  ...BASE,
  items: [
    toSummary(materia204461),
    toSummary(materia204462),
    toSummary(materia204463),
  ],
};

const meta = {
  title: 'Public/Content/Materias/View',
  component: MateriasView,
  decorators: [withWrapper],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof MateriasView>;

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
