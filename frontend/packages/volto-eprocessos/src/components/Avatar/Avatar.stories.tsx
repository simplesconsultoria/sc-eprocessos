import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import Avatar from './Avatar';

const withWrapper: Decorator = (Story: any) => (
  <Wrapper anonymous>
    <div style={{ padding: 24 }}>
      <Story />
    </div>
  </Wrapper>
);

const PLACEHOLDER_AVATAR = 'https://i.pravatar.cc/300?img=12';

const meta = {
  title: 'Public/Components/Avatar',
  component: Avatar,
  decorators: [withWrapper],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'text',
      description:
        'CSS length (e.g. "2.5rem", "120px") applied via the ``--eprocessos-avatar-size`` custom property.',
    },
    loading: {
      control: 'radio',
      options: ['lazy', 'eager'],
    },
    fetchPriority: {
      control: 'radio',
      options: ['high', 'low', 'auto'],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'With image',
  args: {
    src: PLACEHOLDER_AVATAR,
    alt: 'Sample portrait',
  },
};

export const NoSrc: Story = {
  name: 'Placeholder (no src)',
  args: {
    alt: 'Unknown person',
  },
};

export const Large: Story = {
  args: {
    src: PLACEHOLDER_AVATAR,
    alt: 'Sample portrait',
    size: '8rem',
  },
};

export const Small: Story = {
  args: {
    src: PLACEHOLDER_AVATAR,
    alt: 'Sample portrait',
    size: '1.5rem',
  },
};

export const HrefWithRelativeSrc: Story = {
  name: 'Composed via href + relative src',
  args: {
    href: 'https://i.pravatar.cc',
    src: '300?img=8',
    alt: 'Sample portrait',
  },
};

export const BrokenImageFallsBack: Story = {
  name: 'Broken src falls back to placeholder',
  args: {
    src: 'https://this-host-does-not-exist.invalid/missing.jpg',
    alt: 'Broken portrait',
  },
};
