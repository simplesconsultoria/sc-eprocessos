import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import {
  addSubpathPrefix,
  getFieldURL,
  isInternalURL,
} from '@plone/volto/helpers/Url/Url';
import leftSVG from '@plone/volto/icons/left-key.svg';
import rightSVG from '@plone/volto/icons/right-key.svg';
import playSVG from '@plone/volto/icons/play.svg';
import pauseSVG from '@plone/volto/icons/pause.svg';

import type { VereadoresSliderItem } from './index';

const messages = defineMessages({
  heading: {
    id: 'Vereadores slider heading',
    defaultMessage: 'Councilors',
  },
  prev: {
    id: 'Vereadores slider previous',
    defaultMessage: 'Previous',
  },
  next: {
    id: 'Vereadores slider next',
    defaultMessage: 'Next',
  },
  allLabelFallback: {
    id: 'Vereadores slider all link label fallback',
    defaultMessage: 'See all',
  },
  loadError: {
    id: 'Vereadores slider load error',
    defaultMessage: 'Could not load councilors.',
  },
  loading: {
    id: 'Vereadores slider loading',
    defaultMessage: 'Loading councilors…',
  },
  empty: {
    id: 'Vereadores slider empty',
    defaultMessage: 'No councilor.',
  },
  pauseAutoplay: {
    id: 'Vereadores slider pause autoplay',
    defaultMessage: 'Pause autoplay',
  },
  resumeAutoplay: {
    id: 'Vereadores slider resume autoplay',
    defaultMessage: 'Resume autoplay',
  },
  carouselLabel: {
    id: 'Vereadores slider carousel label',
    defaultMessage: 'Councilors carousel',
  },
  slideLabel: {
    id: 'Vereadores slider slide label',
    defaultMessage: 'Slide {current} of {total}',
  },
});

const getVereadorItemPath = (
  item?: VereadoresSliderItem,
): string | undefined => {
  const raw = item?.['@id'];
  if (raw) {
    const path = flattenToAppURL(raw);
    if (typeof path === 'string' && path) {
      return path.startsWith('/') ? path : `/${path}`;
    }
  }
  if (item?.id) return `/vereadores/${item.id}`;
  return undefined;
};

const resolveItemImageSrc = (
  item?: VereadoresSliderItem,
): string | undefined => {
  const base = getVereadorItemPath(item);
  const download = item?.image?.[0]?.download;

  if (!base || !download) return undefined;

  const sanitized = download.startsWith('/++api++')
    ? download.slice('/++api++'.length)
    : download;

  const isBareImages =
    sanitized.startsWith('@@images/') || sanitized.startsWith('/@@images/');
  if (!isBareImages) return undefined;

  return addSubpathPrefix(`${base}/${sanitized.replace(/^\//, '')}`);
};

const getSingleLink = (
  value: Array<{ '@id'?: string; title?: string }> | undefined,
): string | undefined => {
  const urlValue = value ? getFieldURL(value as any) : undefined;
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
  autoplay?: boolean;
  autoplayIntervalSeconds?: number;
}

const DefaultView: React.FC<VereadoresSliderDefaultViewProps> = ({
  items,
  isEditMode,
  isLoading,
  hasError,
  allLink,
  allLinkLabel,
  autoplay,
  autoplayIntervalSeconds,
}) => {
  const intl = useIntl();
  const [index, setIndex] = useState(0);
  const [enterFrom, setEnterFrom] = useState<'left' | 'right' | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [rowMinHeightPx, setRowMinHeightPx] = useState<number | null>(null);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const rowRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const carouselInnerRef = useRef<HTMLDivElement | null>(null);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const hasMany = safeItems.length > 1;
  const canPrev = !isLoading && !hasError && hasMany;
  const canNext = !isLoading && !hasError && hasMany;

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    } catch {
      return false;
    }
  }, []);

  const autoplayConfigured = !!autoplay;
  const autoplayActive =
    autoplayConfigured &&
    !isEditMode &&
    !isAutoplayPaused &&
    !isLoading &&
    !hasError &&
    hasMany &&
    !reducedMotion;

  useEffect(() => {
    if (!autoplayConfigured) setIsAutoplayPaused(false);
  }, [autoplayConfigured]);

  const goPrev = useCallback(() => {
    if (!canPrev) return;
    setEnterFrom('left');
    setAnimationKey((k) => k + 1);
    setIndex((v) =>
      safeItems.length ? (v - 1 + safeItems.length) % safeItems.length : 0,
    );
  }, [canPrev, safeItems.length]);

  const goNext = useCallback(() => {
    if (!canNext) return;
    setEnterFrom('right');
    setAnimationKey((k) => k + 1);
    setIndex((v) => (safeItems.length ? (v + 1) % safeItems.length : 0));
  }, [canNext, safeItems.length]);

  const recomputeRowMinHeight = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!safeItems.length) {
      setRowMinHeightPx(null);
      return;
    }

    const measureRoot = measureRef.current;
    const widthEl = rowRef.current || carouselInnerRef.current;
    if (!measureRoot || !widthEl) return;

    const containerWidth = widthEl.clientWidth;
    if (!containerWidth) return;

    let peopleWidth = containerWidth;
    try {
      const styleEl = rowRef.current || widthEl;
      const computed = window.getComputedStyle(styleEl);

      const flexDirection = computed.flexDirection;
      const gapRaw = (computed.gap || computed.columnGap || '0').toString();
      const gapPx = Number.parseFloat(gapRaw.split(' ')[0]) || 0;

      if (flexDirection !== 'column') {
        const imageSizeRaw = computed
          .getPropertyValue('--vereadores-slider-image-size')
          .trim();

        const percentMatch = imageSizeRaw.match(/^([0-9.]+)%$/);
        const pxMatch = imageSizeRaw.match(/^([0-9.]+)px$/);

        if (percentMatch) {
          const fraction = Number.parseFloat(percentMatch[1]) / 100;
          if (Number.isFinite(fraction) && fraction > 0 && fraction < 1) {
            peopleWidth = Math.max(0, containerWidth * (1 - fraction) - gapPx);
          }
        } else if (pxMatch) {
          const imagePx = Number.parseFloat(pxMatch[1]);
          if (Number.isFinite(imagePx) && imagePx > 0) {
            peopleWidth = Math.max(0, containerWidth - imagePx - gapPx);
          }
        }
      }
    } catch {}

    if (!peopleWidth || peopleWidth < 1) return;

    const fragment = document.createDocumentFragment();
    safeItems.forEach((item) => {
      const wrap = document.createElement('div');
      wrap.className = 'vereadores-slider-block__people people';
      wrap.style.width = `${Math.round(peopleWidth)}px`;

      const nameText = item?.fullname || item?.title || '';
      const partyText = item?.description || '';

      const nameEl = document.createElement('p');
      nameEl.className = 'vereadores-slider-block__name name';
      nameEl.textContent = nameText;
      wrap.appendChild(nameEl);

      if (partyText) {
        const partyEl = document.createElement('p');
        partyEl.className = 'vereadores-slider-block__party title';
        partyEl.textContent = partyText;
        wrap.appendChild(partyEl);
      }

      fragment.appendChild(wrap);
    });

    measureRoot.replaceChildren(fragment);

    let maxHeight = 0;
    for (const child of Array.from(measureRoot.children)) {
      const h = (child as HTMLElement).offsetHeight || 0;
      if (h > maxHeight) maxHeight = h;
    }

    const min = 125;
    const next = Math.max(min, Math.ceil(maxHeight));
    setRowMinHeightPx((prev) => (prev === next ? prev : next));
  }, [safeItems]);

  useEffect(() => {
    setIndex((prev) => {
      if (!safeItems.length) return 0;
      return Math.max(0, Math.min(prev, safeItems.length - 1));
    });
  }, [safeItems.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!safeItems.length) return;

    let disposed = false;
    let frame = 0;

    const schedule = () => {
      if (disposed) return;
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        recomputeRowMinHeight();
      });
    };

    schedule();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => schedule());
      if (carouselInnerRef.current) ro.observe(carouselInnerRef.current);
      if (rowRef.current) ro.observe(rowRef.current);
    } else {
      window.addEventListener('resize', schedule);
    }

    const fontsReady = (document as any)?.fonts?.ready;
    if (fontsReady && typeof fontsReady.then === 'function') {
      fontsReady.then(() => {
        schedule();
      });
    }

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', schedule);
    };
  }, [recomputeRowMinHeight, safeItems.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!autoplayActive) return;

    const rawSeconds =
      typeof autoplayIntervalSeconds === 'number' ? autoplayIntervalSeconds : 5;
    const seconds = Number.isFinite(rawSeconds) ? rawSeconds : 5;
    const intervalMs = Math.max(1, Math.round(seconds)) * 1000;

    const id = window.setInterval(() => {
      goNext();
    }, intervalMs);

    return () => {
      window.clearInterval(id);
    };
  }, [autoplayIntervalSeconds, autoplayActive, goNext]);

  const current = safeItems[index];

  const imageSrc = resolveItemImageSrc(current);
  const name = current?.fullname || current?.title || '';
  const party = current?.description || '';

  const allHref = useMemo(() => getSingleLink(allLink), [allLink]);
  const allLabel =
    (allLinkLabel || '').trim() ||
    intl.formatMessage(messages.allLabelFallback);

  const autoplayToggleLabel = autoplayConfigured
    ? intl.formatMessage(
        isAutoplayPaused ? messages.resumeAutoplay : messages.pauseAutoplay,
      )
    : '';

  const slideLabel = intl.formatMessage(messages.slideLabel, {
    current: safeItems.length ? index + 1 : 0,
    total: safeItems.length,
  });

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
      return <p>{intl.formatMessage(messages.loadError)}</p>;
    }
    return (
      <p>
        {isLoading
          ? intl.formatMessage(messages.loading)
          : intl.formatMessage(messages.empty)}
      </p>
    );
  }

  const itemHref = getVereadorItemPath(current);

  const allLinkIsInternal = allHref ? isInternalURL(allHref) : false;
  const allLinkTo =
    allLinkIsInternal && allHref ? flattenToAppURL(allHref) : '';

  return (
    <section
      className="vereadores-slider-block__testimonials testimonials"
      aria-label={intl.formatMessage(messages.carouselLabel)}
      style={
        rowMinHeightPx
          ? ({
              ['--vereadores-slider-row-min-height' as any]: `${rowMinHeightPx}px`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className="vereadores-slider-block__header">
        <h2 className="vereadores-slider-block__heading section-heading text-highlight">
          {intl.formatMessage(messages.heading)}
        </h2>

        <div className="vereadores-slider-block__controls carousel-controls">
          <button
            type="button"
            className="vereadores-slider-block__arrow vereadores-slider-block__arrow--prev prev"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label={intl.formatMessage(messages.prev)}
          >
            <Icon name={leftSVG} size="24px" />
          </button>

          {autoplayConfigured ? (
            <button
              type="button"
              className="vereadores-slider-block__arrow vereadores-slider-block__arrow--autoplay-toggle"
              onClick={() => setIsAutoplayPaused((v) => !v)}
              aria-label={autoplayToggleLabel}
              aria-pressed={isAutoplayPaused}
              disabled={!!isLoading || !!hasError || !hasMany}
            >
              <Icon name={isAutoplayPaused ? playSVG : pauseSVG} size="24px" />
            </button>
          ) : null}

          <button
            type="button"
            className="vereadores-slider-block__arrow vereadores-slider-block__arrow--next next"
            onClick={goNext}
            disabled={!canNext}
            aria-label={intl.formatMessage(messages.next)}
          >
            <Icon name={rightSVG} size="24px" />
          </button>
        </div>
      </div>

      <div className="vereadores-slider-block__section-content section-content">
        <div
          className="vereadores-slider-block__carousel testimonials-carousel"
          aria-roledescription="carousel"
          aria-label={slideLabel}
        >
          <div
            className="vereadores-slider-block__carousel-inner carousel-inner"
            ref={carouselInnerRef}
          >
            <div
              key={animationKey}
              className={cardClassName}
              aria-live={autoplayActive ? 'off' : 'polite'}
              aria-atomic="true"
            >
              <ConditionalLink
                condition={!isEditMode && !!itemHref}
                to={itemHref || ''}
                className="vereadores-slider-block__item-link"
              >
                <div className="vereadores-slider-block__row row" ref={rowRef}>
                  <div className="vereadores-slider-block__people people">
                    <p className="vereadores-slider-block__name name">{name}</p>
                    {party ? (
                      <p className="vereadores-slider-block__party title">
                        {party}
                      </p>
                    ) : null}
                  </div>

                  {imageSrc ? (
                    <img
                      className="vereadores-slider-block__image profile"
                      src={imageSrc}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
              </ConditionalLink>
            </div>
          </div>

          <div
            ref={measureRef}
            className="vereadores-slider-block__measure"
            aria-hidden="true"
          />

          {allHref ? (
            <div className="vereadores-slider-block__all-link">
              <ConditionalLink
                condition={!isEditMode && !!allHref}
                to={allLinkIsInternal ? allLinkTo : undefined}
                href={!allLinkIsInternal ? allHref : undefined}
                className="vereadores-slider-block__all-link-anchor read-more"
              >
                {allLabel}
                <Icon name={rightSVG} />
              </ConditionalLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default DefaultView;
