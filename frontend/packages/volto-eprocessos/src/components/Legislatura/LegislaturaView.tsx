import { Container } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

import type {
  Legislatura,
  LegislaturaVereadorRef,
} from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { resolveEprocessosAssetUrl } from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';
import VereadorCard from '@simplesconsultoria/volto-eprocessos/components/VereadorCard/VereadorCard';

interface LegislaturaViewProps {
  content?: Legislatura | null;
}

const messages = defineMessages({
  electionDate: {
    id: 'Legislatura view election date',
    defaultMessage: 'Election date',
  },
  start: {
    id: 'Legislatura view start',
    defaultMessage: 'Start',
  },
  end: {
    id: 'Legislatura view end',
    defaultMessage: 'End',
  },
  current: {
    id: 'Legislatura view current badge',
    defaultMessage: 'Current',
  },
  councilors: {
    id: 'Legislatura view councilors heading',
    defaultMessage: 'Councilors',
  },
  empty: {
    id: 'Legislatura view empty councilors',
    defaultMessage: 'No councilor found.',
  },
  error: {
    id: 'Legislatura view error',
    defaultMessage: 'Could not load legislature.',
  },
  viewDetails: {
    id: 'Legislatura view view details button',
    defaultMessage: 'View details',
  },
});

const resolveVereadorImage = (
  item: LegislaturaVereadorRef,
): string | undefined => {
  const download = item?.image?.[0]?.download;
  return resolveEprocessosAssetUrl(download || item?.url_foto);
};

// Dates are ISO-like (YYYY-MM-DD), lexicographic compare works.
const isCurrentByDateRange = (start?: string, end?: string): boolean => {
  if (!start || !end) return false;
  // Dates are ISO-like (YYYY-MM-DD), lexicographic compare works.
  const today = new Date().toISOString().slice(0, 10);
  return start <= today && today <= end;
};

/**
 * Legislatura view component.
 */
const LegislaturaView = ({ content }: LegislaturaViewProps) => {
  const intl = useIntl();

  if (!content) {
    return (
      <Container id="page-document" className="view-wrapper legislatura-view">
        <p>{intl.formatMessage(messages.error)}</p>
      </Container>
    );
  }

  const items = Array.isArray(content.items) ? content.items : [];

  const isCurrent =
    (content as any).atual === true ||
    isCurrentByDateRange(content.start, content.end);

  const rawId = content?.['@id'] || '';
  const appUrl = flattenToAppURL(rawId) || '';
  let basePath = '/vereadores';

  const match = appUrl.match(
    /^(.*)\/(legislaturas|mesa-diretora|vereadores|comissoes)(\/|$)/,
  );
  if (match) {
    basePath = match[1];
  }

  return (
    <Container
      id="page-document"
      className="view-wrapper legislatura-view "
      width="default"
    >
      <header className="legislatura-header">
        <h1 className="documentFirstHeading">{content.title}</h1>
        <div className="legislatura-meta">
          {isCurrent ? (
            <span className="badge badge-current">
              {intl.formatMessage(messages.current)}
            </span>
          ) : null}
          <dl className="legislatura-dates">
            {content.data_eleicao ? (
              <>
                <dt>{intl.formatMessage(messages.electionDate)}</dt>
                <dd>
                  <DataCurta date={content.data_eleicao} defaultValue="-" />
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

      <section className="legislatura-vereadores">
        <h2>{intl.formatMessage(messages.councilors)}</h2>
        {items.length ? (
          <div className="vereadores-grid">
            {items.map((item) => {
              const href = item?.id
                ? `${basePath}/vereadores/${item.id}`.replace(/\/\//g, '/')
                : undefined;

              const party = Array.isArray(item?.partido)
                ? item.partido
                    .map((p) => p.token)
                    .filter(Boolean)
                    .join(', ')
                : '';
              const imageSrc = resolveVereadorImage(item);

              return (
                <VereadorCard
                  key={item.id}
                  href={href}
                  imageSrc={imageSrc}
                  name={item.title}
                  party={party}
                >
                  <span className="vereador-card-body-button">
                    {intl.formatMessage(messages.viewDetails)}
                  </span>
                </VereadorCard>
              );
            })}
          </div>
        ) : (
          <p>{intl.formatMessage(messages.empty)}</p>
        )}
      </section>
    </Container>
  );
};

export default LegislaturaView;
