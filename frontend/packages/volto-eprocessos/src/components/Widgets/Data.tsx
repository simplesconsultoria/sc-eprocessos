import FormattedDate from '@plone/volto/components/theme/FormattedDate/FormattedDate';
import type { ReactNode } from 'react';

interface DataCurtaProps {
  date?: string | null;
  defaultValue?: ReactNode;
}

// FormattedDate's prop types are loose (all required as `any`), so we
// funnel through a cast to keep the call ergonomic.
const DateView = FormattedDate as unknown as React.ComponentType<{
  date: string;
  locale: string;
  format: string;
}>;

export const DataCurta = ({ date, defaultValue = '-' }: DataCurtaProps) => {
  if (!date) {
    return <>{defaultValue}</>;
  }
  return <DateView date={date} locale="pt-BR" format="short" />;
};
