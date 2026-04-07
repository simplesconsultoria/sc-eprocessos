import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import type { ReactNode } from 'react';

/**
 * Item accepted by UniversalLink: either a plain URL string or a
 * content reference object with at least an `@id` and a `title`.
 */
export interface LinkItem {
  '@id': string;
  title?: string;
}

interface LinkProps {
  item?: string | LinkItem | null;
  title?: ReactNode;
  defaultValue?: ReactNode;
}

export const Link = ({ item, title, defaultValue = '' }: LinkProps) => {
  if (!item) {
    return <>{defaultValue}</>;
  }

  if (typeof item === 'string') {
    if (item.trim() === '') {
      return <>{defaultValue}</>;
    }
    return <UniversalLink href={item}>{title ?? item}</UniversalLink>;
  }

  return (
    <UniversalLink item={item}>
      {title ?? item.title ?? item['@id']}
    </UniversalLink>
  );
};
