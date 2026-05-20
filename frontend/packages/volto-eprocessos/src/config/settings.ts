import type { ConfigType } from '@plone/registry';
import Image from '@simplesconsultoria/volto-eprocessos/components/Image/Image';

export default function install(config: ConfigType) {
  // Register a new Image component
  config.registerComponent({ name: 'Image', component: Image });
  return config;
}
