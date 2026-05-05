import { TableBody } from 'react-aria-components';
import { Table } from '@plone/components';
import { TableHeader } from '@plone/components';
import { Row } from '@plone/components';
import { Column } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';
import type { ParticipacaoComissao } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';

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

interface ParticipacaoProps {
  item: ParticipacaoComissao;
}

const Participacao = ({ item }: ParticipacaoProps) => {
  return (
    <Row className="participacao-comissao">
      <Column className="comissao">
        <Link item={item} title={item.comissao} />
      </Column>
      <Column className="titulo">{item.title}</Column>
      <Column>
        <DataCurta date={item.start} />
      </Column>
      <Column>
        <DataCurta date={item.end} />
      </Column>
    </Row>
  );
};

interface ComissoesProps {
  items: ParticipacaoComissao[];
}

const Comissoes = ({ items }: ComissoesProps) => {
  const intl = useIntl();
  return items && items.length > 0 ? (
    <Table
      aria-label={intl.formatMessage(messages.tableLabel)}
      className={'full comissoes'}
    >
      <TableHeader>
        <Row>
          <Column isRowHeader>{intl.formatMessage(messages.committee)}</Column>
          <Column isRowHeader>{intl.formatMessage(messages.title)}</Column>
          <Column isRowHeader>{intl.formatMessage(messages.start)}</Column>
          <Column isRowHeader>{intl.formatMessage(messages.end)}</Column>
        </Row>
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

export default Comissoes;
