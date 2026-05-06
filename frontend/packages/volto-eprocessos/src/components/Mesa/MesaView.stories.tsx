import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type { Mesa } from '@simplesconsultoria/volto-eprocessos/types';
import MesaView from './MesaView';

import mesaCurrent from '../../../../../../eprocessos_mock/data/mesas/7.json';
import mesaPast from '../../../../../../eprocessos_mock/data/mesas/1.json';

const withWrapper: Decorator = (Story: any) => {
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

const CURRENT = mesaCurrent as unknown as Mesa;
const PAST = mesaPast as unknown as Mesa;
const EMPTY = {
  ...(mesaPast as any),
  items: [],
} as Mesa;

const meta = {
  title: 'Public/Content/Mesa',
  component: MesaView,
  decorators: [withWrapper],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof MesaView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CurrentBoard: Story = {
  args: {
    content: CURRENT,
  },
};

export const PastBoard: Story = {
  args: {
    content: PAST,
  },
};

export const EmptyMembers: Story = {
  args: {
    content: EMPTY,
  },
};
