import { Container } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';

import type { Comissao } from '@simplesconsultoria/volto-eprocessos/types';

import Detalhes from './Detalhes';
import Periodos from './Periodos';
import Participantes from './Participantes';
import Reunioes from './Reunioes';
import Sumario from './Sumario';
import {
  normalizeMeetings,
  normalizeParticipants,
  normalizePeriods,
} from './utils';

interface ComissaoViewProps {
  content?: Comissao | null;
}

const messages = defineMessages({
  participants: {
    id: 'Comissao view participants heading',
    defaultMessage: 'Participants',
  },
  meetings: {
    id: 'Comissao view meetings heading',
    defaultMessage: 'Meetings',
  },
  periods: {
    id: 'Comissao view periods heading',
    defaultMessage: 'Periods',
  },
  error: {
    id: 'Comissao view error',
    defaultMessage: 'Could not load committee.',
  },
});

/**
 * Comissao view component.
 */
const ComissaoView = ({ content }: ComissaoViewProps) => {
  const intl = useIntl();

  if (!content || (content as any)['@type'] !== 'Comissao') {
    return (
      <Container id="page-document" className="view-wrapper comissao-view">
        <p>{intl.formatMessage(messages.error)}</p>
      </Container>
    );
  }

  const participants = normalizeParticipants((content as any).items);
  const meetings = normalizeMeetings((content as any).reunioes);
  const periods = normalizePeriods((content as any).periodos);

  const panels = [
    {
      id: 'participantes',
      title: intl.formatMessage(messages.participants),
      content: <Participantes items={participants} />,
    },
    {
      id: 'reunioes',
      title: intl.formatMessage(messages.meetings),
      content: <Reunioes meetings={meetings} />,
    },
    {
      id: 'periodos',
      title: intl.formatMessage(messages.periods),
      content: <Periodos periods={periods} />,
    },
  ];

  return (
    <Container
      id="page-document"
      className="view-wrapper comissao-view"
      width="default"
    >
      <Sumario content={content} />
      <Detalhes items={panels} />
    </Container>
  );
};

export default ComissaoView;
