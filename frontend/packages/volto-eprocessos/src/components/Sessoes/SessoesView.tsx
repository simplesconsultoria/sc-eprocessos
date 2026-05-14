import { Container } from '@plone/components';
import FilterForm from '@simplesconsultoria/volto-eprocessos/components/FilterForm/FilterForm';
import SessoesLista from './SessoesLista';

import type {
  Sessoes,
  SessaoSummary,
} from '@simplesconsultoria/volto-eprocessos/types';

interface SessoesViewProps {
  content: Sessoes;
}

const SessoesView = ({ content }: SessoesViewProps) => {
  const { title, description, form_config, items } = content;

  return (
    <Container
      id="page-document"
      className="view-wrapper sessoes-view"
      width="default"
    >
      <header className="sessoes-header">
        <h1 className="documentFirstHeading">{title}</h1>
        {description ? (
          <p className="documentDescription">{description}</p>
        ) : null}
      </header>
      <article>
        <FilterForm<SessaoSummary>
          schema={form_config}
          items={items}
          ResultsComponent={SessoesLista}
        />
      </article>
    </Container>
  );
};

export default SessoesView;
