import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';
import TabelaPaginada, {
  cell,
  column,
} from '@simplesconsultoria/volto-eprocessos/components/TabelaPaginada/TabelaPaginada';

import type { SessaoSummary } from '@simplesconsultoria/volto-eprocessos/types';

const messages = defineMessages({
  tableLabel: {
    id: 'SessoesLista.tableLabel',
    defaultMessage: 'Sessions',
  },
  date: {
    id: 'SessoesLista.date',
    defaultMessage: 'Date',
  },
  title: {
    id: 'SessoesLista.title',
    defaultMessage: 'Title',
  },
  startTime: {
    id: 'SessoesLista.startTime',
    defaultMessage: 'Start Time',
  },
  endTime: {
    id: 'SessoesLista.endTime',
    defaultMessage: 'End Time',
  },
  type: {
    id: 'SessoesLista.type',
    defaultMessage: 'Type',
  },
  emptyResults: {
    id: 'SessoesLista.emptyResults',
    defaultMessage: 'No sessions.',
  },
});

interface SessoesListaProps {
  items: SessaoSummary[];
}

const SessoesLista = ({ items }: SessoesListaProps) => {
  const intl = useIntl();

  const columns = [
    column('date', intl.formatMessage(messages.date)),
    column('startTime', intl.formatMessage(messages.startTime)),
    column('title', intl.formatMessage(messages.title)),
    column('type', intl.formatMessage(messages.type)),
  ];

  // Memoized so the ``items`` prop handed to ``TabelaPaginada`` keeps a stable
  // reference across re-renders — otherwise ``TabelaPaginada``'s reset-page
  // effect would fire on every render and pagination would snap back to 1.
  const rows = useMemo(
    () =>
      items.map((item) => ({
        date: cell('date', item.date ?? '', <DataCurta date={item.date} />),
        startTime: cell(
          'startTime',
          item.startTime ?? '',
          item.startTime || '-',
        ),
        title: cell(
          'title',
          item.title || '',
          <Link
            item={item['@id'] ?? null}
            title={item.title}
            defaultValue={item.title}
          />,
        ),
        type: cell(
          'type',
          item.type ?? '',
          <span className={`badge-type ${item.type?.toLowerCase() ?? ''}`}>
            {item.type}
          </span>,
        ),
      })),
    [items],
  );

  return (
    <TabelaPaginada
      label={intl.formatMessage(messages.tableLabel)}
      noResultsMessage={intl.formatMessage(messages.emptyResults)}
      columns={columns}
      items={rows}
      rowClassName="sessao"
    />
  );
};

export default SessoesLista;
