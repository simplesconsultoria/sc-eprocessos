import { defineMessages, useIntl } from 'react-intl';

import type { ComissaoParticipante } from '@simplesconsultoria/volto-eprocessos/types';
import { TableBody } from 'react-aria-components';
import { Table } from '@plone/components';
import { TableHeader } from '@plone/components';
import { Row } from '@plone/components';
import { Column } from '@plone/components';
import { Cell } from 'react-aria-components';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';
import { resolveEprocessosAssetUrl } from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';
import Avatar from '@simplesconsultoria/volto-eprocessos/components/Avatar/Avatar';

const messages = defineMessages({
  tableLabel: {
    id: 'Comissao view participants heading',
    defaultMessage: 'Participants',
  },
  role: {
    id: 'Comissao participants role',
    defaultMessage: 'Role',
  },
  name: {
    id: 'Comissao participants name',
    defaultMessage: 'Name',
  },
  term: {
    id: 'Comissao participants term',
    defaultMessage: 'Term',
  },
  party: {
    id: 'Comissao participants party',
    defaultMessage: 'Party',
  },
  photo: {
    id: 'Comissao participants photo',
    defaultMessage: 'Photo',
  },
  emptyParticipants: {
    id: 'Comissao empty participants',
    defaultMessage: 'No participant recorded.',
  },
});

const resolveParticipanteImage = (
  item: ComissaoParticipante,
): string | undefined => {
  const download = (item as any)?.image?.[0]?.download;
  return resolveEprocessosAssetUrl(download || (item as any)?.url_foto);
};

interface ParticipantesProps {
  items: ComissaoParticipante[];
}

const Participantes = ({ items }: ParticipantesProps) => {
  const intl = useIntl();

  if (!items?.length) {
    return <p>{intl.formatMessage(messages.emptyParticipants)}</p>;
  }

  const sorted = [...items].sort((a, b) => {
    const oa = Number.isFinite((a as any).ordem) ? (a as any).ordem : 999;
    const ob = Number.isFinite((b as any).ordem) ? (b as any).ordem : 999;
    if (oa !== ob) return oa - ob;
    return ((a as any).title || '').localeCompare((b as any).title || '');
  });

  return (
    <Table
      aria-label={intl.formatMessage(messages.tableLabel)}
      className={'full comissao-participantes'}
    >
      <TableHeader>
        <Column isRowHeader className={'photo'}>
          {intl.formatMessage(messages.photo)}
        </Column>
        <Column isRowHeader className={'name'}>
          {intl.formatMessage(messages.name)}
        </Column>
        <Column isRowHeader className={'role'}>
          {intl.formatMessage(messages.role)}
        </Column>
        <Column isRowHeader className={'term'}>
          {intl.formatMessage(messages.term)}
        </Column>
        <Column isRowHeader className={'party'}>
          {intl.formatMessage(messages.party)}
        </Column>
      </TableHeader>
      <TableBody>
        {sorted.map((item, idx) => {
          const href = (item as any)?.id
            ? `/vereadores/vereadores/${(item as any).id}`
            : undefined;
          const party = Array.isArray((item as any).partido)
            ? (item as any).partido
                .map((p: any) => p.token)
                .filter(Boolean)
                .join(', ')
            : '';

          const imgSrc = resolveParticipanteImage(item);

          return (
            <Row
              key={`${(item as any).id}-${idx}`}
              className="comissao-participante"
            >
              {/* MUDANÇA AQUI: De Column para Cell */}
              <Cell
                className="foto"
                textValue={intl.formatMessage(messages.photo)}
              >
                <Avatar
                  src={imgSrc}
                  alt={(item as any).title || ''}
                  size="3rem"
                />
              </Cell>

              <Cell className="nome" textValue={(item as any).title || ''}>
                <Link
                  item={href ?? null}
                  title={(item as any).title}
                  defaultValue={(item as any).title}
                />
              </Cell>

              <Cell className="cargo" textValue={(item as any).cargo || ''}>
                {(item as any).cargo}
              </Cell>

              <Cell
                className="mandato"
                textValue={(item as any).mandato || '-'}
              >
                {(item as any).mandato || '-'}
              </Cell>

              <Cell className="partido" textValue={party || '-'}>
                {party || '-'}
              </Cell>
            </Row>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default Participantes;
