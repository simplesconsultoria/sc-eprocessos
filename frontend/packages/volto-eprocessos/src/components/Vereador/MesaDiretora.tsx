import {
  Table,
  TableHeader,
  TableBody,
  Row,
  Column,
} from '@simplesconsultoria/volto-eprocessos/components/Tabela';
import type { ParticipacaoMesa } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';

interface ParticipacaoProps {
  item: ParticipacaoMesa;
}

const Participacao = ({ item }: ParticipacaoProps) => {
  return (
    <Row className="participacao-mesa-diretora">
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

interface MesaDiretoraProps {
  items: ParticipacaoMesa[];
}

const MesaDiretora = ({ items }: MesaDiretoraProps) => {
  return items && items.length > 0 ? (
    <Table aria-label="Mesa Diretora" className={'full mesas'}>
      <TableHeader>
        <Column isRowHeader>Título</Column>
        <Column>Início</Column>
        <Column>Fim</Column>
      </TableHeader>
      <TableBody>
        {items.map((item, idx) => (
          <Participacao key={idx} item={item} />
        ))}
      </TableBody>
    </Table>
  ) : (
    <p>Nenhuma participação cadastrada.</p>
  );
};

export default MesaDiretora;
