import React from 'react';
import { SidebarPortal } from '@plone/volto/components';
import { withBlockExtensions } from '@plone/volto/helpers';

import Data from './Data';
import View from './View';
import type { VereadoresSliderBlockData } from './index';

interface Props {
  data: VereadoresSliderBlockData;
  onChangeBlock: (id: string, data: VereadoresSliderBlockData) => void;
  block: string;
  selected: boolean;
  [key: string]: any;
}

const Edit: React.FC<Props> = (props) => {
  const { data, onChangeBlock, block, selected } = props;

  return (
    <>
      <View {...props} isEditMode />
      <SidebarPortal selected={selected}>
        <Data data={data} block={block} onChangeBlock={onChangeBlock} />
      </SidebarPortal>
    </>
  );
};

export default withBlockExtensions(Edit);
