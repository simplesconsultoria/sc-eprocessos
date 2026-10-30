import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import Data from './Data';

vi.mock('@plone/volto/components/manage/Form/BlockDataForm', () => ({
  default: vi.fn(() => null),
}));

vi.mock('react-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-intl')>()),
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));

const onChangeBlock = vi.fn();

const renderData = (extra: Record<string, unknown> = {}) =>
  render(
    <Data
      data={{ '@type': 'vereadoresSlider', autoplay: true }}
      block="block-1"
      onChangeBlock={onChangeBlock}
      navRoot={{ '@id': 'http://localhost/councilors' } as any}
      contentType="Councilors"
      blocksErrors={{ 'block-1': { source: ['required'] } }}
      {...extra}
    />,
  );

const formProps = () =>
  vi.mocked(BlockDataForm).mock.calls[0][0] as Record<string, any>;

describe('VereadoresSlider Data form', () => {
  beforeEach(() => {
    vi.mocked(BlockDataForm).mockClear();
    onChangeBlock.mockClear();
  });

  it('passes the block id and data to BlockDataForm', () => {
    renderData();
    expect(formProps().block).toBe('block-1');
    expect(formProps().formData).toEqual({
      '@type': 'vereadoresSlider',
      autoplay: true,
    });
  });

  it('forwards onChangeBlock so schema defaults can be stored at once', () => {
    renderData();
    expect(formProps().onChangeBlock).toBe(onChangeBlock);
  });

  it('forwards navRoot and contentType to the schema enhancers', () => {
    renderData();
    expect(formProps().navRoot).toEqual({
      '@id': 'http://localhost/councilors',
    });
    expect(formProps().contentType).toBe('Councilors');
  });

  it('forwards the block errors so validation shows on its fields', () => {
    renderData();
    expect(formProps().errors).toEqual({
      'block-1': { source: ['required'] },
    });
  });

  it('merges one changed field into the block data', () => {
    renderData();
    formProps().onChangeField('autoplay', false);
    expect(onChangeBlock).toHaveBeenCalledWith('block-1', {
      '@type': 'vereadoresSlider',
      autoplay: false,
    });
  });

  it('reads the schema from the block configuration', () => {
    renderData({
      blocksConfig: {
        vereadoresSlider: {
          id: 'vereadoresSlider',
          blockSchema: () => ({ title: 'Custom title', properties: {} }),
        },
      },
    });
    expect(formProps().title).toBe('Custom title');
    expect(formProps().schema.title).toBe('Custom title');
  });
});
