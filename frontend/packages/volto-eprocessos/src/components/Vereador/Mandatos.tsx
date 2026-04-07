import {
  Table,
  TableHeader,
  TableBody,
  Row,
  Column,
} from '@simplesconsultoria/volto-eprocessos/components/Tabela';
import type { Mandato as MandatoType } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';

interface MandatoProps {
  item: MandatoType;
}

const Mandato = ({ item }: MandatoProps) => {
  return (
    <Row className="mandato">
      <Column className="mandato">{item.id}</Column>
      <Column>
        <DataCurta date={item.start} />
      </Column>
      <Column>
        <DataCurta date={item.end} />
      </Column>
      <Column>{item.natureza}</Column>
      <Column>{item.votos}</Column>
    </Row>
  );
};

interface MandatosProps {
  items: MandatoType[];
}

const Mandatos = ({ items }: MandatosProps) => {
  return (
    <Table aria-label="Mandatos" className={'full mandatos'}>
      <TableHeader>
        <Column isRowHeader>Legislatura</Column>
        <Column>Início</Column>
        <Column>Fim</Column>
        <Column>Natureza</Column>
        <Column>Votos</Column>
      </TableHeader>
      <TableBody>
        {items && items.map((item, idx) => <Mandato key={idx} item={item} />)}
      </TableBody>
    </Table>
  );
};

export default Mandatos;
