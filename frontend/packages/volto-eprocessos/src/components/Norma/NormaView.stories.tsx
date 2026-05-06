import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import type {
  Norma,
  NormaSummary,
} from '@simplesconsultoria/volto-eprocessos/types';

import NormaView from './NormaView';

import normaBase from '../../../../../../eprocessos_mock/data/normas/18647.json';
import normaLinked1 from '../../../../../../eprocessos_mock/data/normas/18648.json';
import normaLinked2 from '../../../../../../eprocessos_mock/data/normas/18649.json';

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

const BASE = normaBase as unknown as Norma;

const toSummary = (n: any): NormaSummary => ({
  '@id': n['@id'],
  '@type': n['@type'],
  id: n.id,
  title: n.title,
  description: n.description,
});

const LINKED: Norma = {
  ...BASE,
  normas_vinculadas: [toSummary(normaLinked1), toSummary(normaLinked2)],
};

const WITH_ATTACHMENTS: Norma = {
  ...BASE,
  anexos:
    Array.isArray(BASE.file) && BASE.file.length
      ? [
          {
            ...BASE.file[0],
            filename: `anexo_${BASE.file[0].filename}`,
          },
        ]
      : [
          {
            'content-type': 'application/pdf',
            download: '/sapl_documentos/norma_juridica/anexo_demo.pdf',
            filename: 'anexo_demo.pdf',
            size: '',
          },
        ],
};

const WITH_COMPILED_TEXT: Norma = {
  ...BASE,
  texto_compilado:
    Array.isArray(BASE.file) && BASE.file.length
      ? [
          {
            ...BASE.file[0],
            filename: `texto_compilado_${BASE.file[0].filename}`,
          },
        ]
      : [
          {
            'content-type': 'application/pdf',
            download:
              '/sapl_documentos/norma_juridica/texto_compilado_demo.pdf',
            filename: 'texto_compilado_demo.pdf',
            size: '',
          },
        ],
};

const NO_MATERIAS: Norma = {
  ...BASE,
  materia: [],
};

const REVOKED_STATUS: Norma = {
  ...BASE,
  status: 'Revogada',
};

const NOT_IN_FORCE_STATUS: Norma = {
  ...BASE,
  status: 'Sem vigência',
};

const meta = {
  title: 'Public/Content/Norma',
  component: NormaView,
  decorators: [withWrapper],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'object' },
  },
} satisfies Meta<typeof NormaView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    content: BASE,
  },
};

export const WithLinkedNormas: Story = {
  args: {
    content: LINKED,
  },
};

export const WithAttachments: Story = {
  args: {
    content: WITH_ATTACHMENTS,
  },
};

export const WithCompiledText: Story = {
  args: {
    content: WITH_COMPILED_TEXT,
  },
};

export const NoRelatedMaterias: Story = {
  args: {
    content: NO_MATERIAS,
  },
};

export const Revoked: Story = {
  args: {
    content: REVOKED_STATUS,
  },
};

export const NotInForce: Story = {
  args: {
    content: NOT_IN_FORCE_STATUS,
  },
};
