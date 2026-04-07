import { Container } from '@plone/components';
import type { Vereador } from '@simplesconsultoria/volto-eprocessos/types';
import Filiacoes from './Filiacoes';
import Biografia from './Biografia';
import Detalhes from './Detalhes';
import Mandatos from './Mandatos';
import MesaDiretora from './MesaDiretora';
import Comissoes from './Comissoes';
import Sumario from './Sumario';

interface VereadorViewProps {
  content: Vereador;
}

/**
 * Vereador view component.
 */
const VereadorView = ({ content }: VereadorViewProps) => {
  const { biografia, filiacoes, mesas, comissoes, mandatos } = content;

  const panels = [
    {
      id: 'biografia',
      title: 'Biografia',
      content: <Biografia content={biografia} />,
    },
    {
      id: 'partidos',
      title: 'Filiações',
      content: <Filiacoes items={filiacoes} />,
    },
    {
      id: 'mandatos',
      title: 'Mandatos',
      content: <Mandatos items={mandatos} />,
    },
    {
      id: 'mesas',
      title: 'Mesa Diretora',
      content: <MesaDiretora items={mesas} />,
    },
    {
      id: 'comissoes',
      title: 'Comissões',
      content: <Comissoes items={comissoes} />,
    },
  ];

  return (
    <Container id="page-document" className="view-wrapper vereador-view">
      <Sumario content={content} />
      <Detalhes items={panels} />
    </Container>
  );
};

export default VereadorView;
