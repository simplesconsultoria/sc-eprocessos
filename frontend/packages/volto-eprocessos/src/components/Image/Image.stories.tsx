import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import Image from './Image';

const withWrapper: Decorator = (Story) => (
  <Wrapper anonymous>
    <div style={{ width: 360, padding: 16 }}>
      <Story />
    </div>
  </Wrapper>
);

const meta = {
  title: 'Public/Components/Image',
  component: Image,
  decorators: [withWrapper],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Generic image renderer for e-Processos items. Accepts a real ' +
          'content object (image lives at `item[imageField]`), a catalog ' +
          'brain / summary (image lives at `item.image_scales[imageField]`), ' +
          'or a plain `src` fallback. When the image download URL is ' +
          'absolute (e.g. an upstream e-Processos URL emitted with ' +
          '`eprocessos.proxy_images=false`), it is used as-is; otherwise ' +
          'it is concatenated with the item base path to traverse the ' +
          'local Plone `@@images` proxy.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: { type: 'select' },
      options: ['eager', 'lazy'],
    },
    responsive: { control: 'boolean' },
    alt: { control: 'text' },
    src: { control: 'text' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof Image>;

export default meta;

type Story = StoryObj<typeof meta>;

// ---- Item fixtures ---------------------------------------------------------

const REAL_OBJECT_PROXY = {
  '@id': 'http://localhost:3000/parlamentares/jose-silva',
  image: {
    'content-type': 'image/jpeg',
    download: '@@images/image-400-abcd.jpeg',
    width: 400,
    height: 600,
    scales: {
      preview: {
        download: '@@images/image-200-abcd.jpeg',
        width: 200,
        height: 300,
      },
      large: {
        download: '@@images/image-800-abcd.jpeg',
        width: 800,
        height: 1200,
      },
    },
  },
};

const REAL_OBJECT_DIRECT = {
  '@id': 'http://localhost:3000/parlamentares/jose-silva',
  image: {
    'content-type': 'image/jpeg',
    download:
      'https://e-processos.example.com/sapl_documentos/parlamentar/fotos/546914.jpg',
    width: 400,
    height: 600,
    scales: {
      preview: {
        download:
          'https://e-processos.example.com/sapl_documentos/parlamentar/fotos/546914.jpg',
        width: 200,
        height: 300,
      },
      large: {
        download:
          'https://e-processos.example.com/sapl_documentos/parlamentar/fotos/546914.jpg',
        width: 800,
        height: 1200,
      },
    },
  },
};

const CATALOG_BRAIN = {
  '@id': 'http://localhost:3000/parlamentares/jose-silva',
  image_field: 'image',
  image_scales: {
    image: [
      {
        'content-type': 'image/jpeg',
        download: '@@images/image-400-efgh.jpeg',
        width: 400,
        height: 600,
        scales: {
          preview: {
            download: '@@images/image-200-efgh.jpeg',
            width: 200,
            height: 300,
          },
        },
      },
    ],
  },
};

// ---- Stories ---------------------------------------------------------------

export const FromSrcFallback: Story = {
  args: {
    src: 'https://picsum.photos/seed/eprocessos/360/360',
    alt: 'Imagem de exemplo via src',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Without an `item`, the component renders whatever `src` is given. ' +
          'Useful as a generic `<img>` replacement that respects Volto subpath prefixes.',
      },
    },
  },
};

export const FromRealObjectProxyMode: Story = {
  args: {
    item: REAL_OBJECT_PROXY,
    alt: 'Foto do parlamentar (modo proxy)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Real content object whose `image.download` is a relative ' +
          '`@@images/...` URL. The component traverses it locally via the ' +
          'Plone `@@images` proxy — this is the default mode (' +
          '`eprocessos.proxy_images=true`).',
      },
    },
  },
};

export const FromRealObjectDirectMode: Story = {
  args: {
    item: REAL_OBJECT_DIRECT,
    alt: 'Foto do parlamentar (modo direto)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Real content object whose `image.download` is an absolute upstream ' +
          'URL. Emitted by the backend when `eprocessos.proxy_images=false`. ' +
          'The component returns the URL verbatim instead of concatenating ' +
          'it with the item `@id`. Every scale shares the same absolute URL — ' +
          'browsers can still pick one from `srcset` but no per-scale ' +
          'resizing happens upstream.',
      },
    },
  },
};

export const FromCatalogBrain: Story = {
  args: {
    item: CATALOG_BRAIN,
    alt: 'Foto do parlamentar (catalog brain)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Catalog brain / summary shape — the image lives under ' +
          '`item.image_scales[imageField]` as an array. `imageField` ' +
          'defaults to `item.image_field` or `"image"`.',
      },
    },
  },
};

export const LazyLoading: Story = {
  args: {
    src: 'https://picsum.photos/seed/eprocessos-lazy/360/360',
    alt: 'Imagem com lazy loading',
    loading: 'lazy',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`loading="lazy"` also sets `decoding="async"`. The default ' +
          '`"eager"` instead sets `fetchPriority="high"` for the LCP image.',
      },
    },
  },
};

export const Responsive: Story = {
  args: {
    src: 'https://picsum.photos/seed/eprocessos-responsive/720/360',
    alt: 'Imagem responsiva',
    responsive: true,
    className: 'portrait',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `responsive` boolean adds the `responsive` CSS class alongside ' +
          'any custom `className`.',
      },
    },
  },
};
