import { defineMessages, useIntl } from 'react-intl';

import type { ComissaoReuniao } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';

interface ReunioesProps {
  meetings: ComissaoReuniao[];
}

const messages = defineMessages({
  emptyMeetings: {
    id: 'Comissao empty meetings',
    defaultMessage: 'No meeting recorded.',
  },
});

const Reunioes = ({ meetings }: ReunioesProps) => {
  const intl = useIntl();

  if (!meetings?.length) {
    return <p>{intl.formatMessage(messages.emptyMeetings)}</p>;
  }

  return (
    <ul className="comissao-reunioes">
      {meetings.map((m) => (
        <li key={m.id || (m as any)['@id'] || m.title}>
          <strong>{m.title}</strong>
          {m.date ? (
            <>
              {' — '}
              <DataCurta date={m.date} defaultValue="-" />
            </>
          ) : null}
          {m.startTime ? <> {m.startTime}</> : null}
          {m.endTime ? <>–{m.endTime}</> : null}
        </li>
      ))}
    </ul>
  );
};

export default Reunioes;
