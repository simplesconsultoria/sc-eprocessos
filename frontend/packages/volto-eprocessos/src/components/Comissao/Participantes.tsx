import type { ComissaoParticipante } from '@simplesconsultoria/volto-eprocessos/types';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';
import { resolveEprocessosAssetUrl } from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';
import Avatar from '@simplesconsultoria/volto-eprocessos/components/Avatar/Avatar';
import { defineMessages, useIntl } from 'react-intl';
import { useMemo } from 'react';
import TabelaPaginada, {
  cell,
  column,
} from '@simplesconsultoria/volto-eprocessos/components/TabelaPaginada/TabelaPaginada';

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
  const relativeUrl = resolveEprocessosAssetUrl(
    download || (item as any)?.url_foto,
  );
  return download && download.startsWith('http')
    ? download
    : `${item['@id']}/${relativeUrl}`;
};

interface ParticipantesProps {
  items: ComissaoParticipante[];
}

const Participantes = ({ items }: ParticipantesProps) => {
  const intl = useIntl();

  const columns = [
    column('photo', intl.formatMessage(messages.photo)),
    column('name', intl.formatMessage(messages.name)),
    column('role', intl.formatMessage(messages.role)),
    column('term', intl.formatMessage(messages.term)),
    column('party', intl.formatMessage(messages.party)),
  ];

  const rows = useMemo(
    () =>
      [...(items ?? [])]
        .sort((a, b) => {
          const oa = Number.isFinite((a as any).ordem) ? (a as any).ordem : 999;
          const ob = Number.isFinite((b as any).ordem) ? (b as any).ordem : 999;
          if (oa !== ob) return oa - ob;
          return ((a as any).title || '').localeCompare((b as any).title || '');
        })
        .map((item) => {
          const href = item['@id'];
          const party = Array.isArray((item as any).partido)
            ? (item as any).partido
                .map((p: any) => p.token)
                .filter(Boolean)
                .join(', ')
            : '';

          const imgSrc = resolveParticipanteImage(item);

          return {
            photo: cell(
              'photo',
              (item as any).title || '',
              <Avatar
                href={href}
                src={imgSrc}
                alt={(item as any).title || ''}
                size="3rem"
              />,
            ),
            name: cell(
              'name',
              (item as any).title || '',
              <Link
                item={href ?? null}
                title={(item as any).title}
                defaultValue={(item as any).title}
              />,
            ),
            role: cell('role', (item as any).cargo || '', (item as any).cargo),
            term: cell(
              'term',
              (item as any).mandato || '-',
              (item as any).mandato || '-',
            ),
            party: cell('party', party || '-', party || '-'),
          };
        }),
    [items],
  );

  return (
    <TabelaPaginada
      label={intl.formatMessage(messages.tableLabel)}
      noResultsMessage={intl.formatMessage(messages.emptyParticipants)}
      columns={columns}
      items={rows}
      className="comissao-participantes"
      rowClassName="comissao-participante"
    />
  );
};

export default Participantes;
