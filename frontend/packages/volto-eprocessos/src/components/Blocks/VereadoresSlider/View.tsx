import React, { useEffect, useMemo, useState } from 'react';
import { Api, getFieldURL, withBlockExtensions } from '@plone/volto/helpers';

import type { Vereador } from '@simplesconsultoria/volto-eprocessos/types';
import DefaultView from './DefaultView';
import type { VereadoresSliderBlockData, VereadoresSliderItem } from './index';

type VereadoresFacadeResponse = {
  items?: Vereador[];
};

interface Props {
  data: VereadoresSliderBlockData;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
}

const View: React.FC<Props> = ({ data, className, isEditMode, style }) => {
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

    const api = new Api() as any;
    setIsLoading(true);
    setHasError(false);

    const promise = api.get(sourceUrl) as any;

    promise
      .then((response: VereadoresFacadeResponse) => {
        if (disposed) return;
        const rawItems = Array.isArray(response?.items) ? response.items : [];
        const normalized: VereadoresSliderItem[] = rawItems.map((v) => ({
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
        setItems(normalized);
      })
      .catch((error: any) => {
        if (disposed) return;

        // Ignore abort errors triggered by unmount/source change.
        if (error?.code === 'ABORTED') return;

        setItems([]);
        setHasError(true);
      })
      .finally(() => {
        if (disposed) return;
        setIsLoading(false);
      });

    return () => {
      disposed = true;
      try {
        promise?.request?.abort?.();
      } catch {
        // ignore
      }
    };
  }, [sourceUrl]);

  const sizeClass =
    data.size === 's' || data.size === 'm' || data.size === 'l'
      ? `vereadores-slider-block--size-${data.size}`
      : '';

  if (!sourceUrl && !isEditMode) return null;

  return (
    <div
      className={['block', 'vereadores-slider-block', className]
        .filter(Boolean)
        .concat(sizeClass ? [sizeClass] : [])
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {!sourceUrl && isEditMode ? (
        <p>Selecione a fonte de Vereadores na barra lateral.</p>
      ) : (
        <DefaultView
          items={items}
          isEditMode={isEditMode ?? false}
          isLoading={isLoading}
          hasError={hasError}
          allLink={data.allLink}
          allLinkLabel={data.allLinkLabel}
          size={data.size}
        />
      )}
    </div>
  );
};

export default withBlockExtensions(View);
