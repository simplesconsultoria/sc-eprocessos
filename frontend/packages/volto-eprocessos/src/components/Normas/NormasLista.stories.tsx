import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type { NormaSummary } from '@simplesconsultoria/volto-eprocessos/types';

import NormasLista from './NormasLista';

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

const toSummary = (n: any): NormaSummary => ({
  '@id': n['@id'],
  '@type': n['@type'],
  id: n.id,
  title: n.title,
  description: n.description,
  data_apresentacao: n.data_norma,
});

const ITEMS: NormaSummary[] = [
  toSummary(norma17666),
  toSummary(norma17667),
  toSummary(norma17668),
];

const meta = {
  title: 'Public/Content/Normas/Lista',
  component: NormasLista,
  decorators: [withWrapper],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
  },
} satisfies Meta<typeof NormasLista>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {
  args: { items: ITEMS },
};

export const Empty: Story = {
  args: { items: [] },
};
