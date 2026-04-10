import type { ConfigType } from '@plone/registry';
import calendarSVG from '@plone/volto/icons/calendar.svg';
import LegislaturaView from '@simplesconsultoria/volto-eprocessos/components/Legislatura/LegislaturaView';

export default function install(config: ConfigType) {
  // Icons
  config.settings.contentIcons = {
    ...config.settings.contentIcons,
    Legislatura: calendarSVG,
  };

  // Views
  config.views.contentTypesViews = {
    ...config.views.contentTypesViews,
    Legislatura: LegislaturaView,
  };

  return config;
}
