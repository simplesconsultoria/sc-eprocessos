import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import TabelaPaginada, {
  cell,
  column,
} from '@simplesconsultoria/volto-eprocessos/components/TabelaPaginada/TabelaPaginada';

import type { Filiacao as FiliacaoType } from '@simplesconsultoria/volto-eprocessos/types';

const messages = defineMessages({
  tableLabel: {
    id: 'Vereador party affiliations table',
    defaultMessage: 'Party affiliations',
  },
  party: {
    id: 'Vereador party affiliations column party',
    defaultMessage: 'Party',
  },
  affiliation: {
    id: 'Vereador party affiliations column affiliation',
    defaultMessage: 'Affiliation',
  },
  disaffiliation: {
    id: 'Vereador party affiliations column disaffiliation',
    defaultMessage: 'Disaffiliation',
  },
  empty: {
    id: 'Vereador party affiliations empty',
    defaultMessage: 'No party affiliations recorded.',
  },
});

interface FiliacoesProps {
  items: FiliacaoType[];
}

const Filiacoes = ({ items }: FiliacoesProps) => {
  const intl = useIntl();

  const columns = [
    column('party', intl.formatMessage(messages.party)),
    column('affiliation', intl.formatMessage(messages.affiliation)),
    column('disaffiliation', intl.formatMessage(messages.disaffiliation)),
  ];

  const rows = useMemo(
    () =>
      (items ?? []).map((item) => ({
        party: cell('party', item.token ?? '', item.token),
        affiliation: cell(
          'affiliation',
          item.data_filiacao ?? '',
          <DataCurta date={item.data_filiacao} />,
        ),
        disaffiliation: cell(
          'disaffiliation',
          item.data_desfiliacao ?? '',
          <DataCurta date={item.data_desfiliacao} />,
        ),
      })),
    [items],
  );

  return (
    <TabelaPaginada
      label={intl.formatMessage(messages.tableLabel)}
      noResultsMessage={intl.formatMessage(messages.empty)}
      columns={columns}
      items={rows}
      rowClassName="filiacao"
    />
  );
};

export default Filiacoes;
