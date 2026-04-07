import type { ConfigType } from '@plone/registry';
import type { BlockConfigBase } from '@plone/types';

import VereadoresSliderBlockInfo from '../components/Blocks/VereadoresSlider';

declare module '@plone/types' {
  export interface BlocksConfigData {
    vereadoresSlider: BlockConfigBase;
  }
}

export default function install(config: ConfigType) {
  config.blocks.blocksConfig.vereadoresSlider = VereadoresSliderBlockInfo;

  // Allow local blocks inside gridBlock (same pattern as cm-uberlandia).
  if ((config.blocks.blocksConfig as any).gridBlock) {
    const localBlocks = ['vereadoresSlider'];
    const gridBlock = (config.blocks.blocksConfig as any).gridBlock;

    // Ensure nested blocksConfig exists.
    gridBlock.blocksConfig = {
      ...(gridBlock.blocksConfig || {}),
    };

    if (gridBlock.allowedBlocks) {
      gridBlock.allowedBlocks = [...gridBlock.allowedBlocks, ...localBlocks];
      localBlocks.forEach((blockId) => {
        gridBlock.blocksConfig[blockId] = (config.blocks.blocksConfig as any)[
          blockId
        ];
      });
    }
  }
  return config;
}
