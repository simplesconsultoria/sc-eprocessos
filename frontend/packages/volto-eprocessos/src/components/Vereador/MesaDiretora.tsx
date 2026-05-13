import { TableBody, Cell } from 'react-aria-components';
import { Table } from '@plone/components';
import { TableHeader } from '@plone/components';
import { Row } from '@plone/components';
import { Column } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';
import type { ParticipacaoMesa } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';

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

interface ParticipacaoProps {
  item: ParticipacaoMesa;
}

const Participacao = ({ item }: ParticipacaoProps) => {
  return (
    <Row className="participacao-mesa-diretora">
      <Cell className="titulo" textValue={item.title || 'Título'}>
        {item.title}
      </Cell>
      <Cell textValue={item.start || 'Início'}>
        <DataCurta date={item.start} />
      </Cell>
      <Cell textValue={item.end || 'Fim'}>
        <DataCurta date={item.end} />
      </Cell>
    </Row>
  );
};

interface MesaDiretoraProps {
  items: ParticipacaoMesa[];
}

const MesaDiretora = ({ items }: MesaDiretoraProps) => {
  const intl = useIntl();
  return items && items.length > 0 ? (
    <Table
      aria-label={intl.formatMessage(messages.tableLabel)}
      className={'full mesas'}
    >
      <TableHeader>
        <Column isRowHeader>{intl.formatMessage(messages.title)}</Column>
        <Column>{intl.formatMessage(messages.start)}</Column>
        <Column>{intl.formatMessage(messages.end)}</Column>
      </TableHeader>
      <TableBody>
        {items.map((item, idx) => (
          <Participacao key={idx} item={item} />
        ))}
      </TableBody>
    </Table>
  ) : (
    <p>{intl.formatMessage(messages.empty)}</p>
  );
};

export default MesaDiretora;
