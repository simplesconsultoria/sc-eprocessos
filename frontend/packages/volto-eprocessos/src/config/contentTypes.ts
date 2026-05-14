import type { ConfigType } from '@plone/registry';
import personSVG from '@plone/volto/icons/user.svg';
import VereadorView from '@simplesconsultoria/volto-eprocessos/components/Vereador/VereadorView';
import calendarSVG from '@plone/volto/icons/calendar.svg';
import LegislaturaView from '@simplesconsultoria/volto-eprocessos/components/Legislatura/LegislaturaView';
import ComissaoView from '@simplesconsultoria/volto-eprocessos/components/Comissao/ComissaoView';
import GroupSVG from '@plone/volto/icons/group.svg';
import MateriaView from '@simplesconsultoria/volto-eprocessos/components/Materia/MateriaView';
import MateriasView from '@simplesconsultoria/volto-eprocessos/components/Materias/MateriasView';
import FileSVG from '@plone/volto/icons/file.svg';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import MesaView from '@simplesconsultoria/volto-eprocessos/components/Mesa/MesaView';
import NormaView from '@simplesconsultoria/volto-eprocessos/components/Norma/NormaView';
import NormasView from '@simplesconsultoria/volto-eprocessos/components/Normas/NormasView';
import BookSVG from '@plone/volto/icons/book.svg';
import SessaoView from '@simplesconsultoria/volto-eprocessos/components/Sessao/SessaoView';
import SessoesView from '@simplesconsultoria/volto-eprocessos/components/Sessoes/SessoesView';
import MicrophoneSVG from '@plone/volto/icons/microphone.svg';

export default function install(config: ConfigType) {
  // Icons
  config.settings.contentIcons = {
    ...config.settings.contentIcons,
    Vereador: personSVG,
    Legislatura: calendarSVG,
    Comissao: GroupSVG,
    Materia: FileSVG,
    Materias: FileSVG,
    Mesa: briefcaseSVG,
    Norma: BookSVG,
    Normas: BookSVG,
    Sessao: MicrophoneSVG,
    Sessoes: MicrophoneSVG,
  };

  // Views
  config.views.contentTypesViews = {
    ...config.views.contentTypesViews,
    Vereador: VereadorView,
    Legislatura: LegislaturaView,
    Comissao: ComissaoView,
    Materia: MateriaView,
    Materias: MateriasView,
    Mesa: MesaView,
    Norma: NormaView,
    Normas: NormasView,
    Sessao: SessaoView,
    SessaoPlenaria: SessaoView,
    Sessoes: SessoesView,
  };

  return config;
}
