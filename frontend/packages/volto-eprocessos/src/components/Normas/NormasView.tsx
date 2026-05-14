import { Container } from '@plone/components';
import FilterForm from '@simplesconsultoria/volto-eprocessos/components/FilterForm/FilterForm';
import NormasLista from './NormasLista';

import type {
  Normas,
  NormaSummary,
} from '@simplesconsultoria/volto-eprocessos/types';

interface NormasViewProps {
  content?: Normas | null;
}

const NormasView = ({ content }: NormasViewProps) => {
  if (!content) return null;
  const { title, description, form_config, items } = content;

  return (
    <Container
      id="page-document"
      className="view-wrapper normas-view"
      width="default"
    >
      <header className="normas-header">
        <h1 className="documentFirstHeading">{title}</h1>
        {description ? (
          <p className="documentDescription">{description}</p>
        ) : null}
      </header>
      <article>
        <FilterForm<NormaSummary>
          schema={form_config}
          items={items}
          ResultsComponent={NormasLista}
        />
      </article>
    </Container>
  );
};

export default NormasView;
