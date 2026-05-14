import { Container } from '@plone/components';
import FilterForm from '@simplesconsultoria/volto-eprocessos/components/FilterForm/FilterForm';
import MateriasLista from './MateriasLista';

import type {
  Materias,
  MateriaSummary,
} from '@simplesconsultoria/volto-eprocessos/types';

interface MateriasViewProps {
  content?: Materias | null;
}

const MateriasView = ({ content }: MateriasViewProps) => {
  if (!content) return null;
  const { title, description, form_config, items } = content;

  return (
    <Container
      id="page-document"
      className="view-wrapper materias-view"
      width="default"
    >
      <header className="materias-header">
        <h1 className="documentFirstHeading">{title}</h1>
        {description ? (
          <p className="documentDescription">{description}</p>
        ) : null}
      </header>
      <article>
        <FilterForm<MateriaSummary>
          schema={form_config}
          items={items}
          ResultsComponent={MateriasLista}
        />
      </article>
    </Container>
  );
};

export default MateriasView;
