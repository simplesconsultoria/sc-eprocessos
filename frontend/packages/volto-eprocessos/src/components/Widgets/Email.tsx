import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import type { ReactNode } from 'react';

interface EmailProps {
  value?: string | null;
  defaultValue?: ReactNode;
}

export const Email = ({ value, defaultValue = '' }: EmailProps) => {
  if (!value) {
    return <>{defaultValue}</>;
  }
  return <UniversalLink href={`mailto:${value}`}>{value}</UniversalLink>;
};
