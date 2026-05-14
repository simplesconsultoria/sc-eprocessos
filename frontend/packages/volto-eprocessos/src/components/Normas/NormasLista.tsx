import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';
import TabelaPaginada, {
  cell,
  column,
} from '@simplesconsultoria/volto-eprocessos/components/TabelaPaginada/TabelaPaginada';

import type { NormaSummary } from '@simplesconsultoria/volto-eprocessos/types';

const messages = defineMessages({
  tableLabel: {
    id: 'NormasLista.tableLabel',
    defaultMessage: 'Norms',
  },
  date: {
    id: 'NormasLista.date',
    defaultMessage: 'Date',
  },
  title: {
    id: 'NormasLista.title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'NormasLista.description',
    defaultMessage: 'Description',
  },
  emptyResults: {
    id: 'NormasLista.emptyResults',
    defaultMessage: 'No norms.',
  },
});

interface NormasListaProps {
  items: NormaSummary[];
}

const NormasLista = ({ items }: NormasListaProps) => {
  const intl = useIntl();

  const columns = [
    column('date', intl.formatMessage(messages.date)),
    column('title', intl.formatMessage(messages.title)),
    column('description', intl.formatMessage(messages.description)),
  ];

  const rows = useMemo(
    () =>
      items.map((item) => ({
        date: cell(
          'date',
          item.data_apresentacao ?? '',
          <DataCurta date={item.data_apresentacao} />,
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
        description: cell(
          'description',
          item.description || '',
          item.description || '-',
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
      rowClassName="norma"
    />
  );
};

export default NormasLista;
