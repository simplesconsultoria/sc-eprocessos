import React, { useEffect, useMemo, useState } from 'react';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import { ConditionalLink } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import {
  addSubpathPrefix,
  getFieldURL,
  isInternalURL,
} from '@plone/volto/helpers/Url/Url';
import leftSVG from '@plone/volto/icons/left-key.svg';
import rightSVG from '@plone/volto/icons/right-key.svg';

import type { VereadoresSliderItem } from './index';

const sanitizeScaleUrl = (url: string): string =>
  url.startsWith('/++api++') ? url.slice('/++api++'.length) : url;

const resolveImageSrcFromUrl = (raw?: string): string | undefined => {
  if (!raw) return undefined;

  // External absolute: keep as-is.
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    if (!isInternalURL(raw)) return raw;
    const flattened = sanitizeScaleUrl(flattenToAppURL(raw));
    const path = flattened.startsWith('/') ? flattened : `/${flattened}`;
    return addSubpathPrefix(path);
  }

  const sanitized = sanitizeScaleUrl(raw);
  const path = sanitized.startsWith('/') ? sanitized : `/${sanitized}`;
  return addSubpathPrefix(path);
};

const getVereadorItemPath = (
  item?: VereadoresSliderItem,
): string | undefined => {
  const raw = item?.['@id'];
  if (raw) {
    const path = flattenToAppURL(raw);
    return path?.startsWith('/') ? path : `/${path}`;
  }
  if (item?.id) return `/vereadores/${item.id}`;
  return undefined;
};

const resolveItemImageSrc = (
  item?: VereadoresSliderItem,
): string | undefined => {
  const download = item?.image?.[0]?.download;
  if (download) {
    const internalOrRaw =
      (download.startsWith('http://') || download.startsWith('https://')) &&
      isInternalURL(download)
        ? flattenToAppURL(download)
        : download;
    const sanitized = sanitizeScaleUrl(internalOrRaw);
    const isBareImages =
      sanitized.startsWith('@@images/') || sanitized.startsWith('/@@images/');
    if (isBareImages) {
      const base = getVereadorItemPath(item);
      if (base) {
        const path = `${base}/${sanitized.replace(/^\//, '')}`;
        return addSubpathPrefix(path);
      }
    }

    const resolved = resolveImageSrcFromUrl(download);
    if (resolved) return resolved;
  }

  return resolveImageSrcFromUrl(item?.url_foto || undefined);
};

const getSingleLink = (
  value: Array<{ '@id'?: string; title?: string }> | undefined,
): string | undefined => {
  const urlValue = getFieldURL(value);
  const url = Array.isArray(urlValue) ? urlValue[0] : urlValue;
  return typeof url === 'string' && url ? url : undefined;
};

export interface VereadoresSliderDefaultViewProps {
  items: VereadoresSliderItem[];
  isEditMode?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  allLink?: Array<{ '@id'?: string; title?: string }>;
  allLinkLabel?: string;
  size?: 's' | 'm' | 'l';
}

const DefaultView: React.FC<VereadoresSliderDefaultViewProps> = ({
  items,
  isEditMode,
  isLoading,
  hasError,
  allLink,
  allLinkLabel,
  size,
}) => {
  const [index, setIndex] = useState(0);
  const [enterFrom, setEnterFrom] = useState<'left' | 'right' | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const imageSize = size === 's' ? 120 : size === 'l' ? 200 : 160;

  useEffect(() => {
    setIndex((prev) => {
      if (!safeItems.length) return 0;
      return Math.max(0, Math.min(prev, safeItems.length - 1));
    });
  }, [safeItems.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uniqueSrcs = new Set<string>();

    safeItems.forEach((item) => {
      const src = resolveItemImageSrc(item);
      if (src) uniqueSrcs.add(src);
    });

    const srcs = Array.from(uniqueSrcs);
    if (!srcs.length) {
      setImagesPreloaded(true);
      return;
    }

    let disposed = false;
    setImagesPreloaded(false);

    Promise.allSettled(
      srcs.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new window.Image();
            let done = false;
            const finish = () => {
              if (done) return;
              done = true;
              resolve();
            };
            img.onerror = finish;
            img.onload = () => {
              if (typeof (img as any).decode === 'function') {
                (img as any).decode().then(finish).catch(finish);
              } else {
                finish();
              }
            };
            img.src = src;
          }),
      ),
    ).then(() => {
      if (!disposed) setImagesPreloaded(true);
    });

    return () => {
      disposed = true;
    };
  }, [safeItems]);

  const current = safeItems[index];

  const imageSrc = resolveItemImageSrc(current);
  const name = current?.fullname || current?.title || '';
  const party = current?.description || '';

  const allHref = useMemo(() => getSingleLink(allLink), [allLink]);
  const allLabel = (allLinkLabel || '').trim() || 'Ver todos';

  const hasMany = safeItems.length > 1;
  const canPrev = !isLoading && !hasError && hasMany;
  const canNext = !isLoading && !hasError && hasMany;

  const canNavigate = imagesPreloaded;

  const cardClassName = `vereadores-slider-block__card${
    enterFrom === 'left'
      ? ' vereadores-slider-block__card--from-left'
      : enterFrom === 'right'
        ? ' vereadores-slider-block__card--from-right'
        : ''
  }`;

  if (!safeItems.length) {
    if (!isEditMode) return null;
    if (hasError) {
      return <p>Não foi possível carregar os vereadores.</p>;
    }
    return <p>{isLoading ? 'Carregando vereadores…' : 'Nenhum vereador.'}</p>;
  }

  const itemHref = getVereadorItemPath(current);

  const allLinkIsInternal = allHref ? isInternalURL(allHref) : false;
  const allLinkTo =
    allLinkIsInternal && allHref ? flattenToAppURL(allHref) : '';

  return (
    <section className="vereadores-slider-block__testimonials testimonials">
      <div className="vereadores-slider-block__header">
        <h3 className="vereadores-slider-block__heading section-heading text-highlight">
          Vereadores
        </h3>

        <div className="vereadores-slider-block__controls carousel-controls">
          <button
            type="button"
            className="vereadores-slider-block__arrow vereadores-slider-block__arrow--prev prev"
            onClick={() => {
              setEnterFrom('left');
              setAnimationKey((k) => k + 1);
              setIndex((v) =>
                safeItems.length
                  ? (v - 1 + safeItems.length) % safeItems.length
                  : 0,
              );
            }}
            disabled={!canPrev || !canNavigate}
            aria-label="Anterior"
          >
            <Icon name={leftSVG} size="24px" />
          </button>

          <button
            type="button"
            className="vereadores-slider-block__arrow vereadores-slider-block__arrow--next next"
            onClick={() => {
              setEnterFrom('right');
              setAnimationKey((k) => k + 1);
              setIndex((v) =>
                safeItems.length ? (v + 1) % safeItems.length : 0,
              );
            }}
            disabled={!canNext || !canNavigate}
            aria-label="Próximo"
          >
            <Icon name={rightSVG} size="24px" />
          </button>
        </div>
      </div>

      <div className="vereadores-slider-block__section-content section-content">
        <div
          className="vereadores-slider-block__carousel testimonials-carousel"
          aria-roledescription="carousel"
        >
          <div className="vereadores-slider-block__carousel-inner carousel-inner">
            <div key={animationKey} className={cardClassName}>
              <ConditionalLink
                condition={!isEditMode && !!itemHref}
                to={itemHref || ''}
                className="vereadores-slider-block__item-link"
              >
                <div className="vereadores-slider-block__row row">
                  <p className="vereadores-slider-block__people people">
                    <span className="vereadores-slider-block__name name">
                      {name}
                    </span>
                    <br />
                    {party ? (
                      <span className="vereadores-slider-block__party title">
                        {party}
                      </span>
                    ) : null}
                  </p>

                  {imageSrc ? (
                    <img
                      className="vereadores-slider-block__image profile"
                      src={imageSrc}
                      alt={name}
                      loading="eager"
                      decoding="async"
                      width={imageSize}
                      height={imageSize}
                    />
                  ) : null}
                </div>
              </ConditionalLink>
            </div>
          </div>

          {allHref ? (
            <div className="vereadores-slider-block__all-link">
              <ConditionalLink
                condition={!isEditMode && !!allHref}
                to={allLinkIsInternal ? allLinkTo : undefined}
                href={!allLinkIsInternal ? allHref : undefined}
                className="vereadores-slider-block__all-link-anchor read-more"
              >
                {allLabel}
              </ConditionalLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default DefaultView;
