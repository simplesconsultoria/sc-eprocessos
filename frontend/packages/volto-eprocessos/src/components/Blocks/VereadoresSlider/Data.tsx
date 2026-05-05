import React from 'react';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import { useIntl } from 'react-intl';

import { VereadoresSliderBlockSchema } from './schema';
import type { VereadoresSliderBlockData } from './index';

interface Props {
  data: VereadoresSliderBlockData;
  block: string;
  onChangeBlock: (id: string, data: VereadoresSliderBlockData) => void;
  [key: string]: any;
}

const Data: React.FC<Props> = (props) => {
  const { data, block, onChangeBlock } = props;
  const intl = useIntl();

  const schema = VereadoresSliderBlockSchema({
    ...props,
    intl,
    formData: data,
  } as any);

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
      formData={data}
      block={block}
    />
  );
};

export default Data;
