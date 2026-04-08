import type { ConfigType } from '@plone/registry';
import installSettings from './config/settings';
import installTypes from './config/contentTypes';
import installBlocks from './config/blocks';

function applyConfig(config: ConfigType) {
  installSettings(config);
  installTypes(config);
  installBlocks(config);

  return config;
}

export default applyConfig;
