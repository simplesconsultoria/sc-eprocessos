import React, { useEffect, useMemo, useState } from 'react';
import { Api, getFieldURL, withBlockExtensions } from '@plone/volto/helpers';
import { defineMessages, useIntl } from 'react-intl';

import type { Vereador } from '@simplesconsultoria/volto-eprocessos/types';
import DefaultView from './DefaultView';
import type { VereadoresSliderBlockData, VereadoresSliderItem } from './index';

const messages = defineMessages({
  missingSource: {
    id: 'Vereadores slider missing source',
    defaultMessage: 'Select the councilors source in the sidebar.',
  },
});

type VereadoresFacadeResponse = {
  items?: Vereador[];
};

type CacheEntry = {
  promise?: Promise<VereadoresSliderItem[]>;
  data?: VereadoresSliderItem[];
  error?: unknown;
};

const vereadoresItemsCache = new Map<string, CacheEntry>();

const normalizeVereadoresResponse = (
  response: VereadoresFacadeResponse,
): VereadoresSliderItem[] => {
  const rawItems = Array.isArray(response?.items) ? response.items : [];
  return rawItems.map((v) => ({
    '@id': v['@id'],
    id: v.id,
    title: v.title,
    fullname: v.fullname,
    description: v.description,
    image: Array.isArray(v.image) ? v.image : undefined,
    image_field: v.image_field,
    image_scales: v.image_scales,
    url_foto: v.url_foto,
  }));
};

const fetchVereadoresItems = (
  sourceUrl: string,
): Promise<VereadoresSliderItem[]> => {
  const cached = vereadoresItemsCache.get(sourceUrl);
  if (cached?.data) return Promise.resolve(cached.data);
  if (cached?.error) return Promise.reject(cached.error);
  if (cached?.promise) return cached.promise;

  const api = new Api() as any;
  const promise = (api.get(sourceUrl) as any)
    .then((response: VereadoresFacadeResponse) => {
      const normalized = normalizeVereadoresResponse(response);
      vereadoresItemsCache.set(sourceUrl, { data: normalized });
      return normalized;
    })
    .catch((error: any) => {
      vereadoresItemsCache.set(sourceUrl, { error });
      throw error;
    });

  vereadoresItemsCache.set(sourceUrl, { promise });
  return promise;
};

interface Props {
  data: VereadoresSliderBlockData;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
}

const View: React.FC<Props> = ({ data, className, isEditMode, style }) => {
  const intl = useIntl();
  const sourceUrl = useMemo(() => {
    const urlValue = getFieldURL(data.source);
    const url = Array.isArray(urlValue) ? urlValue[0] : urlValue;
    return typeof url === 'string' && url ? url : undefined;
  }, [data.source]);
  const [items, setItems] = useState<VereadoresSliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!sourceUrl) {
      setItems([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    let disposed = false;
    setIsLoading(true);
    setHasError(false);

    fetchVereadoresItems(sourceUrl)
      .then((normalized) => {
        if (disposed) return;
        setItems(normalized);
      })
      .catch((error: any) => {
        if (disposed) return;

        setItems([]);
        setHasError(true);
      })
      .finally(() => {
        if (disposed) return;
        setIsLoading(false);
      });

    return () => {
      disposed = true;
    };
  }, [sourceUrl]);

  if (!sourceUrl && !isEditMode) return null;

  return (
    <div
      className={['block', 'vereadores-slider-block', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {!sourceUrl && isEditMode ? (
        <p>{intl.formatMessage(messages.missingSource)}</p>
      ) : (
        <DefaultView
          items={items}
          isEditMode={isEditMode ?? false}
          isLoading={isLoading}
          hasError={hasError}
          allLink={data.allLink}
          allLinkLabel={data.allLinkLabel}
          autoplay={data.autoplay}
          autoplayIntervalSeconds={data.autoplayIntervalSeconds}
        />
      )}
    </div>
  );
};

export default withBlockExtensions(View);
