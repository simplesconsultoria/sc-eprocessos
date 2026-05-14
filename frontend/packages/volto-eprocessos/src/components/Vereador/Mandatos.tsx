import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import TabelaPaginada, {
  cell,
  column,
} from '@simplesconsultoria/volto-eprocessos/components/TabelaPaginada/TabelaPaginada';

import type { Mandato as MandatoType } from '@simplesconsultoria/volto-eprocessos/types';

const messages = defineMessages({
  tableLabel: {
    id: 'Vereador terms table',
    defaultMessage: 'Terms',
  },
  legislature: {
    id: 'Vereador terms column legislature',
    defaultMessage: 'Legislature',
  },
  start: {
    id: 'Vereador table column start',
    defaultMessage: 'Start',
  },
  end: {
    id: 'Vereador table column end',
    defaultMessage: 'End',
  },
  nature: {
    id: 'Vereador terms column nature',
    defaultMessage: 'Nature',
  },
  votes: {
    id: 'Vereador terms column votes',
    defaultMessage: 'Votes',
  },
  empty: {
    id: 'Vereador terms empty',
    defaultMessage: 'No terms recorded.',
  },
});

interface MandatosProps {
  items: MandatoType[];
}

const Mandatos = ({ items }: MandatosProps) => {
  const intl = useIntl();

  const columns = [
    column('legislature', intl.formatMessage(messages.legislature)),
    column('start', intl.formatMessage(messages.start)),
    column('end', intl.formatMessage(messages.end)),
    column('nature', intl.formatMessage(messages.nature)),
    column('votes', intl.formatMessage(messages.votes)),
  ];

  const rows = useMemo(
    () =>
      (items ?? []).map((item) => ({
        legislature: cell('legislature', String(item.id), item.id),
        start: cell('start', item.start ?? '', <DataCurta date={item.start} />),
        end: cell('end', item.end ?? '', <DataCurta date={item.end} />),
        nature: cell('nature', item.natureza ?? '', item.natureza),
        votes: cell('votes', String(item.votos ?? ''), item.votos),
      })),
    [items],
  );

  return (
    <TabelaPaginada
      label={intl.formatMessage(messages.tableLabel)}
      noResultsMessage={intl.formatMessage(messages.empty)}
      columns={columns}
      items={rows}
      rowClassName="mandato"
    />
  );
};

export default Mandatos;
