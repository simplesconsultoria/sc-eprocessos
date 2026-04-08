import { Container } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';
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

const messages = defineMessages({
  biography: {
    id: 'Vereador view biography',
    defaultMessage: 'Biography',
  },
  affiliations: {
    id: 'Vereador view affiliations',
    defaultMessage: 'Affiliations',
  },
  terms: {
    id: 'Vereador view terms',
    defaultMessage: 'Terms',
  },
  executiveBoard: {
    id: 'Vereador view executive board',
    defaultMessage: 'Executive board',
  },
  committees: {
    id: 'Vereador view committees',
    defaultMessage: 'Committees',
  },
});

/**
 * Vereador view component.
 */
const VereadorView = ({ content }: VereadorViewProps) => {
  const intl = useIntl();
  const { biografia, filiacoes, mesas, comissoes, mandatos } = content;

  const panels = [
    {
      id: 'biografia',
      title: intl.formatMessage(messages.biography),
      content: <Biografia content={biografia} />,
    },
    {
      id: 'partidos',
      title: intl.formatMessage(messages.affiliations),
      content: <Filiacoes items={filiacoes} />,
    },
    {
      id: 'mandatos',
      title: intl.formatMessage(messages.terms),
      content: <Mandatos items={mandatos} />,
    },
    {
      id: 'mesas',
      title: intl.formatMessage(messages.executiveBoard),
      content: <MesaDiretora items={mesas} />,
    },
    {
      id: 'comissoes',
      title: intl.formatMessage(messages.committees),
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
