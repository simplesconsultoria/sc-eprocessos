import {
  Table,
  TableHeader,
  TableBody,
  Row,
  Column,
} from '@simplesconsultoria/volto-eprocessos/components/Tabela';
import type { Filiacao as FiliacaoType } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';

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
  return (
    <Table aria-label="Filiações partidárias" className={'full filiacoes'}>
      <TableHeader>
        <Column isRowHeader>Partido</Column>
        <Column>Filiação</Column>
        <Column>Desfiliação</Column>
      </TableHeader>
      <TableBody>
        {items && items.map((item, idx) => <Filiacao key={idx} item={item} />)}
      </TableBody>
    </Table>
  );
};

export default Filiacoes;
