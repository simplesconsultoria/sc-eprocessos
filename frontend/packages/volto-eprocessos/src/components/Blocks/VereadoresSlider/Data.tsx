import React from 'react';
import type { BlockEditProps, BlockSchemaProps } from '@plone/types';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import config from '@plone/volto/registry';
import { useIntl } from 'react-intl';

import { VereadoresSliderBlockSchema } from './schema';
import type { VereadoresSliderBlockData } from './index';

export interface VereadoresSliderDataProps
  extends Partial<
    Pick<
      BlockEditProps,
      'blocksConfig' | 'blocksErrors' | 'contentType' | 'navRoot'
    >
  > {
  data: VereadoresSliderBlockData;
  block: string;
  onChangeBlock: (id: string, data: VereadoresSliderBlockData) => void;
  [key: string]: any;
}

const Data: React.FC<VereadoresSliderDataProps> = (props) => {
  const {
    data,
    block,
    blocksConfig = config.blocks.blocksConfig,
    blocksErrors,
    contentType,
    navRoot,
    onChangeBlock,
  } = props;
  const intl = useIntl();
  // `@plone/types` declares `IntlShape['messages']` more narrowly than the
  // `react-intl` Volto ships. Cast until that is fixed upstream.
  const schemaIntl = intl as BlockSchemaProps['intl'];
  // The sidebar reads the schema from the block configuration, like the
  // `@blocks-schema` endpoint does, so a customized `blockSchema` applies to both.
  const blockSchema =
    blocksConfig?.[data['@type']]?.blockSchema ?? VereadoresSliderBlockSchema;
  const schema =
    typeof blockSchema === 'function'
      ? blockSchema({ ...props, intl: schemaIntl })
      : blockSchema;

  const onChangeField = (id: string, value: any) => {
    onChangeBlock(block, {
      ...data,
      [id]: value,
    });
  };

  return (
    <BlockDataForm
      schema={schema}
      title={schema.title}
      onChangeField={onChangeField}
      onChangeBlock={onChangeBlock}
      formData={data}
      block={block}
      navRoot={navRoot}
      contentType={contentType}
      errors={blocksErrors}
    />
  );
};

export default Data;
