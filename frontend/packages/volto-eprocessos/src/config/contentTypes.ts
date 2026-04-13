import type { ConfigType } from '@plone/registry';
import personSVG from '@plone/volto/icons/user.svg';
import VereadorView from '@simplesconsultoria/volto-eprocessos/components/Vereador/VereadorView';
import calendarSVG from '@plone/volto/icons/calendar.svg';
import LegislaturaView from '@simplesconsultoria/volto-eprocessos/components/Legislatura/LegislaturaView';
import ComissaoView from '@simplesconsultoria/volto-eprocessos/components/Comissao/ComissaoView';
import GroupSVG from '@plone/volto/icons/group.svg';

export default function install(config: ConfigType) {
  // Icons
  config.settings.contentIcons = {
    ...config.settings.contentIcons,
    Vereador: personSVG,
    Legislatura: calendarSVG,
    Comissao: GroupSVG,
  };

  // Views
  config.views.contentTypesViews = {
    ...config.views.contentTypesViews,
    Vereador: VereadorView,
    Legislatura: LegislaturaView,
    Comissao: ComissaoView,
  };

  return config;
}
