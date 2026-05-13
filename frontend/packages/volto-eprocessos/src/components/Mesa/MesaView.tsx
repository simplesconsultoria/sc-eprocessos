import { Container } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import type {
  Mesa,
  MesaParticipante,
} from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';
import {
  resolveEprocessosAssetUrl,
  resolveEprocessosFacadePath,
} from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';
import VereadorCard from '@simplesconsultoria/volto-eprocessos/components/VereadorCard/VereadorCard';

interface MesaViewProps {
  content?: Mesa | null;
}

const messages = defineMessages({
  legislature: {
    id: 'Mesa view legislature',
    defaultMessage: 'Legislature',
  },
  start: {
    id: 'Mesa view start',
    defaultMessage: 'Start',
  },
  end: {
    id: 'Mesa view end',
    defaultMessage: 'End',
  },
  current: {
    id: 'Mesa view current badge',
    defaultMessage: 'Current',
  },
  members: {
    id: 'Mesa view members heading',
    defaultMessage: 'Members',
  },
  empty: {
    id: 'Mesa view empty members',
    defaultMessage: 'No member found.',
  },
  error: {
    id: 'Mesa view error',
    defaultMessage: 'Could not load executive board.',
  },
});

const resolveParticipantImage = (
  item: MesaParticipante,
): string | undefined => {
  const download = item?.image?.[0]?.download;
  return resolveEprocessosAssetUrl(download || item?.url_foto);
};

const normalizeCargo = (value?: string): string => (value || '').trim();

const cargoRank = (cargo: string): number => {
  const c = normalizeCargo(cargo).toLowerCase();

  if (c === '') return 999;

  if (c.includes('presidente') && !c.includes('vice')) return 0;

  if (c.includes('vice-presidente') || c.includes('vice presidente')) {
    const m = c.match(/(\d+)/);
    const ord = m ? Number.parseInt(m[1], 10) : 99;
    return 10 + (Number.isFinite(ord) ? ord : 99);
  }

  if (c.includes('secret')) {
    const m = c.match(/(\d+)/);
    const ord = m ? Number.parseInt(m[1], 10) : 99;
    return 20 + (Number.isFinite(ord) ? ord : 99);
  }

  return 100;
};

const sortMembers = (items: MesaParticipante[]): MesaParticipante[] => {
  return [...items].sort((a, b) => {
    const ra = cargoRank(a.cargo);
    const rb = cargoRank(b.cargo);
    if (ra !== rb) return ra - rb;

    const ca = normalizeCargo(a.cargo).localeCompare(normalizeCargo(b.cargo));
    if (ca !== 0) return ca;

    return (a.title || '').localeCompare(b.title || '');
  });
};

const ParticipanteCard = ({
  item,
  basePath,
}: {
  item: MesaParticipante;
  basePath: string;
}) => {
  const imgSrc = resolveParticipantImage(item);
  const href = item?.id
    ? `${basePath}/vereadores/${item.id}`.replace(/\/\//g, '/')
    : undefined;

  const party = Array.isArray(item?.partido)
    ? item.partido
        .map((p) => p.token)
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <VereadorCard
      className="mesa-participante-card"
      href={href}
      imageSrc={imgSrc}
      name={item.title || '-'}
      party={party}
      avatarSize="5rem"
    >
      {item.cargo ? <p className="cargo">{item.cargo}</p> : null}
    </VereadorCard>
  );
};

/**
 * Mesa view component.
 */
const MesaView = ({ content }: MesaViewProps) => {
  const intl = useIntl();

  if (!content) {
    return (
      <Container id="page-document" className="view-wrapper mesa-view">
        <p>{intl.formatMessage(messages.error)}</p>
      </Container>
    );
  }

  const items = Array.isArray(content.items) ? content.items : [];
  const sortedItems = sortMembers(items);

  const isCurrent = (content as any).atual === true;

  const legislaturaHref = resolveEprocessosFacadePath(content.legislatura_id);
  const legislaturaLabel = content.legislatura;

  const rawId = content?.['@id'] || '';
  const appUrl = flattenToAppURL(rawId) || '';
  let basePath = '/vereadores';
  const match = appUrl.match(
    /^(.*)\/(mesa-diretora|vereadores|comissoes)(\/|$)/,
  );
  if (match) {
    basePath = match[1];
  }

  return (
    <Container
      id="page-document"
      className="view-wrapper mesa-view"
      width="default"
    >
      <header className="mesa-header">
        <h1 className="documentFirstHeading">{content.title}</h1>
        {content.description ? (
          <p className="documentDescription">{content.description}</p>
        ) : null}

        <div className="mesa-meta">
          {isCurrent ? (
            <span className="badge badge-current">
              {intl.formatMessage(messages.current)}
            </span>
          ) : null}

          <dl>
            {legislaturaHref || legislaturaLabel ? (
              <>
                <dt>{intl.formatMessage(messages.legislature)}</dt>
                <dd>
                  {legislaturaHref ? (
                    <Link
                      item={legislaturaHref}
                      title={legislaturaLabel || legislaturaHref}
                    />
                  ) : (
                    <>{legislaturaLabel}</>
                  )}
                </dd>
              </>
            ) : null}

            <dt>{intl.formatMessage(messages.start)}</dt>
            <dd>
              <DataCurta date={content.start} defaultValue="-" />
            </dd>
            <dt>{intl.formatMessage(messages.end)}</dt>
            <dd>
              <DataCurta date={content.end} defaultValue="-" />
            </dd>
          </dl>
        </div>
      </header>

      <section className="mesa-participantes">
        <h2>{intl.formatMessage(messages.members)}</h2>
        {sortedItems.length ? (
          <div className="mesa-participantes-grid">
            {sortedItems.map((item, idx) => (
              <ParticipanteCard
                key={`${item.id}-${idx}`}
                item={item}
                basePath={basePath}
              />
            ))}
          </div>
        ) : (
          <p>{intl.formatMessage(messages.empty)}</p>
        )}
      </section>
    </Container>
  );
};

export default MesaView;
