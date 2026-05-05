import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type { Materia } from '@simplesconsultoria/volto-eprocessos/types';
import MateriaView from './MateriaView';

import materiaManyAuthors from '../../../../../../eprocessos_mock/data/materias/253133.json';
import materiaInProgress from '../../../../../../eprocessos_mock/data/materias/251667.json';

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

const MANY_AUTHORS = materiaManyAuthors as unknown as Materia;
const IN_PROGRESS = materiaInProgress as unknown as Materia;

const PROJETO_DE_LEI_WITH_ATTACHMENTS = {
  ...MANY_AUTHORS,
  title: 'Projeto de Lei Ordinária nº 1/2026',
  accessoryDocument:
    Array.isArray((MANY_AUTHORS as any).file) &&
    (MANY_AUTHORS as any).file.length
      ? [
          {
            ...(MANY_AUTHORS as any).file[0],
            filename: `acessorio_${(MANY_AUTHORS as any).file[0].filename}`,
          },
        ]
      : [
          {
            'content-type': 'application/pdf',
            download: '/sapl_documentos/materia/acessorio_demo.pdf',
            filename: 'acessorio_demo.pdf',
            size: '',
          },
        ],
  voteResult: [
    {
      date: '2026-04-01',
      result: 'APROVADO',
      yes: 0,
      no: 0,
      abstention: 0,
    },
  ],
} as Materia;

const meta = {
  title: 'Public/Content/Materia',
  component: MateriaView,
  decorators: [withWrapper],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof MateriaView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ManyAuthorsAndProcessing: Story = {
  args: {
    content: MANY_AUTHORS,
  },
};

export const InProgress: Story = {
  args: {
    content: IN_PROGRESS,
  },
};

export const ProjetoDeLeiLike: Story = {
  args: {
    content: PROJETO_DE_LEI_WITH_ATTACHMENTS,
  },
};
