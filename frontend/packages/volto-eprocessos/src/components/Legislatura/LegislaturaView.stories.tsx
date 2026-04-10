import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type { Legislatura } from '@simplesconsultoria/volto-eprocessos/types';
import LegislaturaView from './LegislaturaView';

import legislaturasList from '../../../../../../eprocessos_mock/data/legislaturas/list.json';
import legislatura20 from '../../../../../../eprocessos_mock/data/legislaturas/20.json';
import legislatura19 from '../../../../../../eprocessos_mock/data/legislaturas/19.json';

type LegislaturasList = {
  items?: Array<{ id: string; atual?: boolean }>;
};

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

const list = legislaturasList as unknown as LegislaturasList;
const currentFromList = (list.items || []).find((i) => i.atual);
const currentId = currentFromList?.id;

const CURRENT = {
  ...(legislatura20 as any),
  atual: currentId ? currentId === (legislatura20 as any).id : true,
} as Legislatura;

const PAST = {
  ...(legislatura19 as any),
  atual: false,
} as Legislatura;

const EMPTY = {
  ...CURRENT,
  items: [],
} as Legislatura;

const meta = {
  title: 'Public/Content/Legislatura',
  component: LegislaturaView,
  decorators: [withWrapper],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof LegislaturaView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CurrentLegislature: Story = {
  args: {
    content: CURRENT,
  },
};

export const PastLegislature: Story = {
  args: {
    content: PAST,
  },
};

export const EmptyCouncilors: Story = {
  args: {
    content: EMPTY,
  },
};
