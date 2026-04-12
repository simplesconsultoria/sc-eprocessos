import type { ConfigType } from '@plone/registry';
import personSVG from '@plone/volto/icons/user.svg';
import VereadorView from '@simplesconsultoria/volto-eprocessos/components/Vereador/VereadorView';
import calendarSVG from '@plone/volto/icons/calendar.svg';
import LegislaturaView from '@simplesconsultoria/volto-eprocessos/components/Legislatura/LegislaturaView';

export default function install(config: ConfigType) {
  // Icons
  config.settings.contentIcons = {
    ...config.settings.contentIcons,
    Vereador: personSVG,
    Legislatura: calendarSVG,
  };

  // Views
  config.views.contentTypesViews = {
    ...config.views.contentTypesViews,
    Vereador: VereadorView,
    Legislatura: LegislaturaView,
  };

  return config;
}
