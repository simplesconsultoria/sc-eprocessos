import {
  Table,
  TableHeader,
  TableBody,
  Row,
  Column,
} from '@simplesconsultoria/volto-eprocessos/components/Tabela';
import { defineMessages, useIntl } from 'react-intl';
import type { Filiacao as FiliacaoType } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';

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
});

interface FiliacaoProps {
  item: FiliacaoType;
}

const Filiacao = ({ item }: FiliacaoProps) => {
  return (
    <Row className="filiacao">
      <Column className="token">{item.token}</Column>
      <Column>
        <DataCurta date={item.data_filiacao} />
      </Column>
      <Column>
        <DataCurta date={item.data_desfiliacao} />
      </Column>
    </Row>
  );
};

interface FiliacoesProps {
  items: FiliacaoType[];
}

const Filiacoes = ({ items }: FiliacoesProps) => {
  const intl = useIntl();
  return (
    <Table
      aria-label={intl.formatMessage(messages.tableLabel)}
      className={'full filiacoes'}
    >
      <TableHeader>
        <Column isRowHeader>{intl.formatMessage(messages.party)}</Column>
        <Column>{intl.formatMessage(messages.affiliation)}</Column>
        <Column>{intl.formatMessage(messages.disaffiliation)}</Column>
      </TableHeader>
      <TableBody>
        {items && items.map((item, idx) => <Filiacao key={idx} item={item} />)}
      </TableBody>
    </Table>
  );
};

export default Filiacoes;
