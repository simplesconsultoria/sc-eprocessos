import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import TabelaPaginada, {
  cell,
  column,
} from '@simplesconsultoria/volto-eprocessos/components/TabelaPaginada/TabelaPaginada';

import type { ParticipacaoMesa } from '@simplesconsultoria/volto-eprocessos/types';

const messages = defineMessages({
  tableLabel: {
    id: 'Vereador executive board table',
    defaultMessage: 'Executive board',
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

interface MesaDiretoraProps {
  items: ParticipacaoMesa[];
}

const MesaDiretora = ({ items }: MesaDiretoraProps) => {
  const intl = useIntl();

  const columns = [
    column('title', intl.formatMessage(messages.title)),
    column('start', intl.formatMessage(messages.start)),
    column('end', intl.formatMessage(messages.end)),
  ];

  const rows = useMemo(
    () =>
      (items ?? []).map((item) => ({
        title: cell('title', item.title ?? '', item.title),
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
      rowClassName="participacao-mesa-diretora"
    />
  );
};

export default MesaDiretora;
