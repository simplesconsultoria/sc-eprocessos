import React from 'react';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';

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
  const { selected } = props;

  return (
    <>
      <View {...props} isEditMode />
      <SidebarPortal selected={selected}>
        <Data {...props} />
      </SidebarPortal>
    </>
  );
};

export default withBlockExtensions(Edit);
