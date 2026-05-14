import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type { SessaoSummary } from '@simplesconsultoria/volto-eprocessos/types';

import SessoesLista from './SessoesLista';

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

const ITEMS: SessaoSummary[] = [
  toSummary(sessao1486),
  toSummary(sessao1492),
  toSummary(sessao1493),
];

const meta = {
  title: 'Public/Content/Sessoes/Lista',
  component: SessoesLista,
  decorators: [withWrapper],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
  },
} satisfies Meta<typeof SessoesLista>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {
  args: { items: ITEMS },
};

export const Empty: Story = {
  args: { items: [] },
};
