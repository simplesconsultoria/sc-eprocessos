import { Container, Button } from '@plone/components';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import personSVG from '@plone/volto/icons/user.svg';
import { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import type {
  Legislatura,
  LegislaturaVereadorRef,
} from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { UniversalLink } from '@plone/volto/components';
import { resolveEprocessosAssetUrl } from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';

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

const isCurrentByDateRange = (start?: string, end?: string): boolean => {
  if (!start || !end) return false;
  // Dates are ISO-like (YYYY-MM-DD), lexicographic compare works.
  const today = new Date().toISOString().slice(0, 10);
  return start <= today && today <= end;
};

const VereadorCard = ({ item }: { item: LegislaturaVereadorRef }) => {
  const intl = useIntl();
  const imgSrc = resolveVereadorImage(item);
  const [imageFailed, setImageFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setImageFailed(false);
  }, [imgSrc]);

  // If the image already failed before hydration (SSR), React's `onError`
  // won't fire. Detect broken image after mount.
  useEffect(() => {
    if (!imgSrc) return;
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth === 0) {
      setImageFailed(true);
    }
  }, [imgSrc]);

  const href = item?.id ? `/vereadores/${item.id}` : undefined;
  const party = Array.isArray(item?.partido)
    ? item.partido
        .map((p) => p.token)
        .filter(Boolean)
        .join(', ')
    : '';

  const showPlaceholder = !imgSrc || imageFailed;

  const CardInner = (
    <div className="vereador-card">
      <div className="vereador-card-image">
        {showPlaceholder ? (
          <Icon
            name={personSVG}
            className="vereador-card-image-placeholder"
            size="7.5rem"
            style={{ width: '7.5rem' }}
            ariaHidden={true}
          />
        ) : (
          <img
            ref={imgRef}
            src={imgSrc}
            alt={item.title}
            onError={() => setImageFailed(true)}
            fetchPriority="high"
          />
        )}
      </div>
      <div className="vereador-card-body">
        <h4 className="vereador-card-title">{item.title}</h4>
        {party ? <p className="vereador-card-party">{party}</p> : null}
        <Button
          className="vereador-card-body-button"
          aria-label={intl.formatMessage(messages.viewDetails)}
        >
          {intl.formatMessage(messages.viewDetails)}
        </Button>
      </div>
    </div>
  );

  if (href) {
    return (
      <UniversalLink href={href} className="vereador-outer" title={item.title}>
        {CardInner}
      </UniversalLink>
    );
  }

  return <div className="vereador-outer">{CardInner}</div>;
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
            {items.map((item) => (
              <VereadorCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p>{intl.formatMessage(messages.empty)}</p>
        )}
      </section>
    </Container>
  );
};

export default LegislaturaView;
