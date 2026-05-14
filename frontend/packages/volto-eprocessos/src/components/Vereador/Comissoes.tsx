import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';
import TabelaPaginada, {
  cell,
  column,
} from '@simplesconsultoria/volto-eprocessos/components/TabelaPaginada/TabelaPaginada';

import type { ParticipacaoComissao } from '@simplesconsultoria/volto-eprocessos/types';

const messages = defineMessages({
  tableLabel: {
    id: 'Vereador committees table',
    defaultMessage: 'Committees',
  },
  committee: {
    id: 'Vereador committees column committee',
    defaultMessage: 'Committee',
  },
  title: {
    id: 'Vereador table column title',
    defaultMessage: 'Title',
  },
  start: {
    id: 'Vereador table column start',
    defaultMessage: 'Start',
  },
  end: {
    id: 'Vereador table column end',
    defaultMessage: 'End',
  },
  empty: {
    id: 'Vereador table empty participation',
    defaultMessage: 'No participation recorded.',
  },
});

interface ComissoesProps {
  items: ParticipacaoComissao[];
}

const Comissoes = ({ items }: ComissoesProps) => {
  const intl = useIntl();

  const columns = [
    column('committee', intl.formatMessage(messages.committee)),
    column('title', intl.formatMessage(messages.title)),
    column('start', intl.formatMessage(messages.start)),
    column('end', intl.formatMessage(messages.end)),
  ];

  const rows = useMemo(
    () =>
      (items ?? []).map((item) => ({
        committee: cell(
          'committee',
          item.comissao ?? '',
          <Link item={item} title={item.comissao} />,
        ),
        title: cell(
          'title',
          item.title ?? '',
          <span className="pill">{item.title}</span>,
        ),
        start: cell('start', item.start ?? '', <DataCurta date={item.start} />),
        end: cell('end', item.end ?? '', <DataCurta date={item.end} />),
      })),
    [items],
  );

  return (
    <TabelaPaginada
      label={intl.formatMessage(messages.tableLabel)}
      noResultsMessage={intl.formatMessage(messages.empty)}
      columns={columns}
      items={rows}
      rowClassName="participacao-comissao"
    />
  );
};

export default Comissoes;
