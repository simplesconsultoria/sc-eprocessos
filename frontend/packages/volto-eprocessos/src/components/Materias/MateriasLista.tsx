import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';
import TabelaPaginada, {
  cell,
  column,
} from '@simplesconsultoria/volto-eprocessos/components/TabelaPaginada/TabelaPaginada';

import type { MateriaSummary } from '@simplesconsultoria/volto-eprocessos/types';

const messages = defineMessages({
  tableLabel: {
    id: 'MateriasLista.tableLabel',
    defaultMessage: 'Matters',
  },
  date: {
    id: 'MateriasLista.date',
    defaultMessage: 'Date',
  },
  title: {
    id: 'MateriasLista.title',
    defaultMessage: 'Title',
  },
  authorship: {
    id: 'MateriasLista.authorship',
    defaultMessage: 'Authorship',
  },
  emptyResults: {
    id: 'MateriasLista.emptyResults',
    defaultMessage: 'No matters.',
  },
});

interface MateriasListaProps {
  items: MateriaSummary[];
}

const formatAuthorship = (item: MateriaSummary): string => {
  if (!Array.isArray(item.authorship)) return '';
  return item.authorship
    .map((entry) => entry?.title)
    .filter(Boolean)
    .join(', ');
};

const MateriasLista = ({ items }: MateriasListaProps) => {
  const intl = useIntl();

  const columns = [
    column('date', intl.formatMessage(messages.date)),
    column('title', intl.formatMessage(messages.title)),
    column('authorship', intl.formatMessage(messages.authorship)),
  ];

  const rows = useMemo(
    () =>
      items.map((item) => {
        const authorship = formatAuthorship(item);
        return {
          date: cell('date', item.date ?? '', <DataCurta date={item.date} />),
          title: cell(
            'title',
            item.title || '',
            <Link
              item={item['@id'] ?? null}
              title={item.title}
              defaultValue={item.title}
            />,
          ),
          authorship: cell('authorship', authorship, authorship || '-'),
        };
      }),
    [items],
  );

  return (
    <TabelaPaginada
      label={intl.formatMessage(messages.tableLabel)}
      noResultsMessage={intl.formatMessage(messages.emptyResults)}
      columns={columns}
      items={rows}
      rowClassName="materia"
    />
  );
};

export default MateriasLista;
