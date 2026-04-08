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

const LONG_NAME_ITEMS: VereadoresSliderItem[] = [
  {
    id: '1',
    fullname: 'Eliusmarcio Alves de Carvalho (Elinho da Academia)',
    description: 'MOBILIZA',
    image: [
      {
        download: 'https://picsum.photos/seed/vereador-long/350/350',
        filename: 'long.jpg',
      },
    ],
  },
  {
    id: '2',
    fullname: 'Abatenio de Andrade Marquez Neto',
    description: 'PP',
    image: [
      {
        download: 'https://picsum.photos/seed/vereador-long-2/350/350',
        filename: 'long-2.jpg',
      },
    ],
  },
];

const NO_IMAGE_ITEMS: VereadoresSliderItem[] = [
  {
    id: '1',
    fullname: 'Vereador sem imagem',
    description: 'SEM PARTIDO',
  },
  {
    id: '2',
    fullname: 'Outro vereador sem imagem',
    description: 'INDEPENDENTE',
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
    '--theme-top-high-contrast-foreground-color': '#1b1c1d',
    '--theme-top-low-contrast-foreground-color': '#585858',
    '--link-foreground-color': '#1b1c1d',
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
    autoplay: { control: 'boolean' },
    autoplayIntervalSeconds: { control: 'number' },
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
    autoplay: false,
    autoplayIntervalSeconds: 5,
  },
};

export const LongNames: Story = {
  parameters: { containerWidth: 420 },
  args: {
    items: LONG_NAME_ITEMS,
    isEditMode: false,
    isLoading: false,
    hasError: false,
    allLink: [{ '@id': 'https://example.com/vereadores' }],
    allLinkLabel: 'Ver todos os vereadores',
    autoplay: false,
    autoplayIntervalSeconds: 5,
  },
};

export const VeryNarrowContainer: Story = {
  parameters: { containerWidth: 180 },
  args: {
    items: LONG_NAME_ITEMS,
    isEditMode: false,
    isLoading: false,
    hasError: false,
    allLink: [{ '@id': 'https://example.com/vereadores' }],
    allLinkLabel: 'Ver todos os vereadores',
    autoplay: false,
    autoplayIntervalSeconds: 5,
  },
};

export const NoImage: Story = {
  args: {
    items: NO_IMAGE_ITEMS,
    isEditMode: false,
    isLoading: false,
    hasError: false,
    allLink: [{ '@id': 'https://example.com/vereadores' }],
    allLinkLabel: 'Ver todos os vereadores',
    autoplay: false,
    autoplayIntervalSeconds: 5,
  },
};

export const Autoplay: Story = {
  args: {
    items: ITEMS,
    isEditMode: false,
    isLoading: false,
    hasError: false,
    allLink: [{ '@id': 'https://example.com/vereadores' }],
    allLinkLabel: 'Ver todos os vereadores',
    autoplay: true,
    autoplayIntervalSeconds: 2,
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
  },
};

export const Loading: Story = {
  args: {
    items: [],
    isEditMode: true,
    isLoading: true,
    hasError: false,
  },
};

export const Error: Story = {
  args: {
    items: [],
    isEditMode: true,
    isLoading: false,
    hasError: true,
  },
};
