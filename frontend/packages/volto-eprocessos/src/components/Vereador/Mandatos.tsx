import { TableBody } from 'react-aria-components';
import { Table } from '@plone/components';
import { TableHeader } from '@plone/components';
import { Row } from '@plone/components';
import { Column } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';
import type { Mandato as MandatoType } from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';

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
});

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
  const intl = useIntl();
  return (
    <Table
      aria-label={intl.formatMessage(messages.tableLabel)}
      className={'full mandatos'}
    >
      <TableHeader>
        <Column isRowHeader>{intl.formatMessage(messages.legislature)}</Column>
        <Column>{intl.formatMessage(messages.start)}</Column>
        <Column>{intl.formatMessage(messages.end)}</Column>
        <Column>{intl.formatMessage(messages.nature)}</Column>
        <Column>{intl.formatMessage(messages.votes)}</Column>
      </TableHeader>
      <TableBody>
        {items && items.map((item, idx) => <Mandato key={idx} item={item} />)}
      </TableBody>
    </Table>
  );
};

export default Mandatos;
