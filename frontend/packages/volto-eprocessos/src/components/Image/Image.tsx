import type { ImgHTMLAttributes } from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import {
  flattenToAppURL,
  flattenScales,
  addSubpathPrefix,
} from '@plone/volto/helpers/Url/Url';

interface ImageScale {
  download: string;
  width: number;
  height: number;
}

interface ImageInfo {
  'content-type'?: string;
  download: string;
  width?: number | string;
  height?: number | string;
  base_path?: string;
  scales?: Record<string, ImageScale>;
}

/**
 * Item shape accepted by `Image`. Two flavors share the same prop:
 * - a "real" content object (no `image_scales` envelope), whose image
 *   lives at `item[imageField]`;
 * - a catalog brain / summary, whose images live at
 *   `item.image_scales[imageField]` as an array.
 */
interface ImageItem {
  '@id': string;
  image_field?: string;
  image_scales?: Record<string, ImageInfo[] | undefined>;
  [key: string]: unknown;
}

interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  /** Context item that owns the image field (real object or catalog brain). */
  item?: ImageItem;
  /** Image field name. Defaults to `item.image_field` or `'image'`. */
  imageField?: string;
  /** Fallback URL when `item` is not provided. */
  src?: string;
  alt?: string;
  /** Defaults to `'eager'`. */
  loading?: 'eager' | 'lazy';
  /** Adds the `responsive` class to the rendered `<img>`. */
  responsive?: boolean;
  className?: string;
}

export default function Image({
  item,
  imageField,
  src,
  alt = '',
  loading = 'eager',
  responsive = false,
  className = '',
  ...imageProps
}: ImageProps) {
  const site = useSelector(
    (state: { site?: { data?: Record<string, unknown> } }) => state.site?.data,
  );
  const siteImageScales =
    (site?.['plone.image_scales'] as Record<string, unknown> | undefined) ?? {};

  if (!item && !src) return null;

  const attrs: ImgHTMLAttributes<HTMLImageElement> = {};
  attrs.className = cx(className, { responsive }) || undefined;

  if (!item && src) {
    attrs.src = addSubpathPrefix(src);
  } else if (item) {
    const isFromRealObject = !item.image_scales;
    const imageFieldWithDefault = imageField || item.image_field || 'image';

    const rawImage = isFromRealObject
      ? (item[imageFieldWithDefault] as ImageInfo | undefined)
      : item.image_scales?.[imageFieldWithDefault]?.[0];

    if (!rawImage) return null;
    const image = flattenScales(item['@id'], rawImage) as ImageInfo | undefined;
    if (!image) return null;

    const isSvg = image['content-type'] === 'image/svg+xml';
    // When `base_path` is present (e.g. `preview_image_link`) use it as base path.
    const basePath = addSubpathPrefix(
      flattenToAppURL(image.base_path || item['@id']),
    );
    const rawSrc = rawImage.download;
    attrs.src =
      rawSrc && rawSrc.startsWith('http')
        ? rawSrc
        : `${basePath}/${image.download}`;
    attrs.width = image.width;
    attrs.height = image.height;

    if (!isSvg && image.scales && Object.keys(image.scales).length > 0) {
      const sortedScales = Object.values({
        ...image.scales,
        ...(Object.keys(siteImageScales).length >
        Object.keys(image.scales).length
          ? {
              original: {
                download: `${image.download}`,
                width: image.width as number,
                height: image.height as number,
              },
            }
          : {}),
      }).sort((a, b) => {
        if (a.width > b.width) return 1;
        if (a.width < b.width) return -1;
        return 0;
      });

      attrs.srcSet = sortedScales
        .map((scale) => {
          const imgSrc = scale.download.startsWith('http')
            ? scale.download
            : `${basePath}/${scale.download}`;
          return `${imgSrc} ${scale.width}w`;
        })
        .join(', ');
    }
  }

  if (loading === 'lazy') {
    attrs.loading = 'lazy';
    attrs.decoding = 'async';
  } else {
    attrs.fetchPriority = 'high';
  }

  return <img {...attrs} alt={alt} {...imageProps} />;
}
