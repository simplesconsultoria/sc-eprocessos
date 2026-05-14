import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';

import TabelaPaginada from './TabelaPaginada';

const withWrapper: Decorator = (Story: any) => (
  <Wrapper anonymous>
    <div style={{ width: 960, padding: 24 }}>
      <Story />
    </div>
  </Wrapper>
);

const COLUMNS = [
  { id: 'date', className: 'date', children: 'Date' },
  { id: 'title', className: 'title', children: 'Title' },
  { id: 'status', className: 'status', children: 'Status' },
];

const ITEMS = [
  {
    date: {
      id: 'date',
      className: 'date',
      textValue: '2026-04-12',
      children: '2026-04-12',
    },
    title: {
      id: 'title',
      className: 'title',
      textValue: 'First entry',
      children: <a href="/demo">First entry</a>,
    },
    status: {
      id: 'status',
      className: 'status',
      textValue: 'open',
      children: <span className="badge-status open">open</span>,
    },
  },
  {
    date: {
      id: 'date',
      className: 'date',
      textValue: '2026-04-15',
      children: '2026-04-15',
    },
    title: {
      id: 'title',
      className: 'title',
      textValue: 'Second entry',
      children: <a href="/demo">Second entry</a>,
    },
    status: {
      id: 'status',
      className: 'status',
      textValue: 'closed',
      children: <span className="badge-status closed">closed</span>,
    },
  },
  {
    date: {
      id: 'date',
      className: 'date',
      textValue: '2026-05-02',
      children: '2026-05-02',
    },
    title: {
      id: 'title',
      className: 'title',
      textValue: 'Third entry',
      children: <a href="/demo">Third entry</a>,
    },
    status: {
      id: 'status',
      className: 'status',
      textValue: 'draft',
      children: <span className="badge-status draft">draft</span>,
    },
  },
];

const meta = {
  title: 'Public/Components/TabelaPaginada',
  component: TabelaPaginada,
  decorators: [withWrapper],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TabelaPaginada>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {
  args: {
    label: 'Demo results',
    noResultsMessage: 'No results.',
    columns: COLUMNS,
    items: ITEMS,
    rowClassName: 'demo',
  },
};

export const Empty: Story = {
  args: {
    label: 'Demo results',
    noResultsMessage: 'No results.',
    columns: COLUMNS,
    items: [],
    rowClassName: 'demo',
  },
};

const STATUSES = ['open', 'closed', 'draft'] as const;

const MANY_ITEMS = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1;
  const status = STATUSES[i % STATUSES.length];
  const date = `2026-${String((i % 12) + 1).padStart(2, '0')}-${String(
    (i % 28) + 1,
  ).padStart(2, '0')}`;
  return {
    date: {
      id: 'date',
      className: 'date',
      textValue: date,
      children: date,
    },
    title: {
      id: 'title',
      className: 'title',
      textValue: `Entry #${n}`,
      children: <a href="/demo">{`Entry #${n}`}</a>,
    },
    status: {
      id: 'status',
      className: 'status',
      textValue: status,
      children: <span className={`badge-status ${status}`}>{status}</span>,
    },
  };
});

export const Paginated: Story = {
  name: 'Paginated (30 items, size 10)',
  args: {
    label: 'Demo results',
    noResultsMessage: 'No results.',
    columns: COLUMNS,
    items: MANY_ITEMS,
    rowClassName: 'demo',
    size: 10,
  },
};
