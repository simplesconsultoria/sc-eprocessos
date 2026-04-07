import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import DefaultView from './DefaultView';
import type { VereadoresSliderItem } from './index';

const ITEMS: VereadoresSliderItem[] = [
  {
    id: '1',
    fullname: 'Mario da Silva',
    description: 'PP',
    image: [
      {
        download: 'https://picsum.photos/seed/vereador-1/350/350',
        filename: 'mario.jpg',
      },
    ],
  },
  {
    id: '2',
    fullname: 'João Pereira',
    description: 'PSB',
    image: [
      {
        download: 'https://picsum.photos/seed/vereador-2/350/350',
        filename: 'AdrianoZago.jpg',
      },
    ],
  },
  {
    id: '3',
    fullname: 'Ana Souza',
    description: 'MDB',
    image: [
      {
        download:
          'https://e-processos.camarauberlandia.mg.gov.br/sapl_documentos/parlamentar/fotos/25988_foto_parlamentar',
        filename: 'Amanda Gondim.jpg',
      },
    ],
  },
];

type StoryParams = {
  containerWidth?: number;
};

const withWrapper: Decorator = (Story, context) => {
  const params = (context?.parameters || {}) as StoryParams;
  const containerWidth = params.containerWidth ?? 960;

  const themeStyle = {
    '--theme-color': '#ffffff',
    '--theme-foreground-color': '#1b1c1d',
    '--theme-high-contrast-color': '#e0e0e0',
    '--theme-high-contrast-foreground-color': '#1b1c1d',
    '--theme-top-foreground-color': '#1b1c1d',
    '--theme-low-contrast-foreground-color': '#585858',
  } as React.CSSProperties;

  return (
    <Wrapper anonymous>
      <div style={{ width: containerWidth, padding: 24, ...themeStyle }}>
        <div className="block vereadores-slider-block">
          <Story />
        </div>
      </div>
    </Wrapper>
  );
};

const meta = {
  title: 'Public/Blocks/VereadoresSlider',
  component: DefaultView,
  decorators: [withWrapper],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
    isEditMode: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    hasError: { control: 'boolean' },
    allLink: { control: 'object' },
    allLinkLabel: { control: 'text' },
    size: { control: { type: 'radio' }, options: ['s', 'm', 'l'] },
  },
} satisfies Meta<typeof DefaultView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: ITEMS,
    isEditMode: false,
    isLoading: false,
    hasError: false,
    allLink: [{ '@id': 'https://example.com/vereadores' }],
    allLinkLabel: 'Ver todos os vereadores',
    size: 'm',
  },
};

export const EditMode: Story = {
  args: {
    items: ITEMS,
    isEditMode: true,
    isLoading: false,
    hasError: false,
    allLink: [{ '@id': 'https://example.com/vereadores' }],
    allLinkLabel: 'Ver todos os vereadores',
    size: 'm',
  },
};

export const Loading: Story = {
  args: {
    items: [],
    isEditMode: true,
    isLoading: true,
    hasError: false,
    size: 'm',
  },
};
