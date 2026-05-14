import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type { MateriaSummary } from '@simplesconsultoria/volto-eprocessos/types';

import MateriasLista from './MateriasLista';

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

const toSummary = (m: any): MateriaSummary => ({
  '@id': m['@id'],
  '@type': m['@type'],
  id: m.id,
  title: m.title,
  description: m.description,
  date: m.date,
  authorship: m.authorship,
});

const ITEMS: MateriaSummary[] = [
  toSummary(materia204461),
  toSummary(materia204462),
  toSummary(materia204463),
];

const meta = {
  title: 'Public/Content/Materias/Lista',
  component: MateriasLista,
  decorators: [withWrapper],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
  },
} satisfies Meta<typeof MateriasLista>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {
  args: { items: ITEMS },
};

export const Empty: Story = {
  args: { items: [] },
};
