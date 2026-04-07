import type { ConfigType } from '@plone/registry';
import personSVG from '@plone/volto/icons/user.svg';
import VereadorView from '@simplesconsultoria/volto-eprocessos/components/Vereador/VereadorView';

export default function install(config: ConfigType) {
  // Icons
  config.settings.contentIcons = {
    ...config.settings.contentIcons,
    Vereador: personSVG,
  };

  // Views
  config.views.contentTypesViews = {
    ...config.views.contentTypesViews,
    Vereador: VereadorView,
  };

  return config;
}
