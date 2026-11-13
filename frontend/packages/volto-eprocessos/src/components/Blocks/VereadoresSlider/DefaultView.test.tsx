import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import DefaultView, {
  type VereadoresSliderDefaultViewProps,
} from './DefaultView';
import type { VereadoresSliderItem } from './index';

vi.mock(
  '@plone/volto/components/manage/ConditionalLink/ConditionalLink',
  () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
);

vi.mock('@plone/volto/components/theme/Icon/Icon', () => ({
  default: () => null,
}));

vi.mock('react-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-intl')>()),
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));

const items: VereadoresSliderItem[] = [
  { '@id': '/councilors/maria', fullname: 'Maria Silva', description: 'A' },
  { '@id': '/councilors/joao', fullname: 'João Santos', description: 'B' },
];

const renderView = (props: Partial<VereadoresSliderDefaultViewProps> = {}) =>
  render(<DefaultView items={items} {...props} />);

const heading = (container: HTMLElement) =>
  container.querySelector('.vereadores-slider-block__heading')?.textContent;

describe('VereadoresSlider DefaultView', () => {
  it('shows the configured title as the heading', () => {
    const { container } = renderView({ title: 'Vereadores em exercício' });
    expect(heading(container)).toBe('Vereadores em exercício');
  });

  it('shows the configured title in edit mode too', () => {
    const { container } = renderView({
      title: 'Vereadores em exercício',
      isEditMode: true,
    });
    expect(heading(container)).toBe('Vereadores em exercício');
  });

  it.each([undefined, '', '   '])(
    'falls back to the default heading when the title is %j',
    (title) => {
      const { container } = renderView({ title });
      expect(heading(container)).toBe('Councilors');
    },
  );
});
