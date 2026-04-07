import {
  Table,
  TableHeader,
  TableBody,
  Row,
  Column,
} from '@simplesconsultoria/volto-eprocessos/components/Tabela';
import type { ParticipacaoComissao } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';

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
  return items && items.length > 0 ? (
    <Table aria-label="Comissões" className={'full comissoes'}>
      <TableHeader>
        <Row>
          <Column isRowHeader>Comissão</Column>
          <Column isRowHeader>Título</Column>
          <Column isRowHeader>Início</Column>
          <Column isRowHeader>Fim</Column>
        </Row>
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

export default Comissoes;
