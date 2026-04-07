import type { ConfigType } from '@plone/registry';
import installSettings from './config/settings';
import installTypes from './config/contentTypes';

function applyConfig(config: ConfigType) {
  installSettings(config);
  installTypes(config);

  return config;
}

export default applyConfig;
