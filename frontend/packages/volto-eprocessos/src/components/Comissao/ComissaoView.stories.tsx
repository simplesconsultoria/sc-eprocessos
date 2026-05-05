import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type { Comissao } from '@simplesconsultoria/volto-eprocessos/types';
import ComissaoView from './ComissaoView';

import comissaoFull from '../../../../../../eprocessos_mock/data/comissoes/32.json';

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

const FULL = comissaoFull as unknown as Comissao;

const EMPTY_ITEMS = {
  ...(comissaoFull as any),
  items: [],
} as Comissao;

const EMPTY_REUNIOES_PERIODOS = {
  ...(comissaoFull as any),
  reunioes: { ...(comissaoFull as any).reunioes, items: [] },
  periodos: [],
} as Comissao;

const meta = {
  title: 'Public/Content/Comissao',
  component: ComissaoView,
  decorators: [withWrapper],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof ComissaoView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullData: Story = {
  args: {
    content: FULL,
  },
};

export const EmptyParticipants: Story = {
  args: {
    content: EMPTY_ITEMS,
  },
};

export const EmptyMeetingsAndPeriods: Story = {
  args: {
    content: EMPTY_REUNIOES_PERIODOS,
  },
};

export const ErrorFallback: Story = {
  args: {
    content: null,
  },
};
