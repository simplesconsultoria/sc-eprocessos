import { Container } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';

import type {
  Norma,
  NormaMateriaRef,
  NormaSummary,
} from '@simplesconsultoria/volto-eprocessos/types';
import { Link } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Link';
import { FileAttachmentList } from '@simplesconsultoria/volto-eprocessos/components/FileAttachment/FileAttachment';
import {
  resolveEprocessosAssetUrl,
  resolveEprocessosFacadePath,
} from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';

interface NormaViewProps {
  content?: Norma | null;
}

const messages = defineMessages({
  error: {
    id: 'Norma view error',
    defaultMessage: 'Could not load norm.',
  },
  status: {
    id: 'Norma view status label',
    defaultMessage: 'Status',
  },
  dateNorma: {
    id: 'Norma view date norma label',
    defaultMessage: 'Norm date',
  },
  datePublication: {
    id: 'Norma view date publication label',
    defaultMessage: 'Publication date',
  },
  publicationVehicle: {
    id: 'Norma view publication vehicle label',
    defaultMessage: 'Publication vehicle',
  },
  files: {
    id: 'Norma view files heading',
    defaultMessage: 'Files',
  },
  attachments: {
    id: 'Norma view attachments heading',
    defaultMessage: 'Attachments',
  },
  compiledText: {
    id: 'Norma view compiled text heading',
    defaultMessage: 'Compiled text',
  },
  fullText: {
    id: 'Norma view full text button',
    defaultMessage: 'Full text',
  },
  noFiles: {
    id: 'Norma view no files',
    defaultMessage: 'No files.',
  },
  materias: {
    id: 'Norma view related materias heading',
    defaultMessage: 'Related matters',
  },
  originMatter: {
    id: 'Norma view origin matter label',
    defaultMessage: 'Origin matter',
  },
  noMaterias: {
    id: 'Norma view no materias',
    defaultMessage: 'No related matters.',
  },
  linkedNormas: {
    id: 'Norma view linked norms heading',
    defaultMessage: 'Linked norms',
  },
  noLinkedNormas: {
    id: 'Norma view no linked norms',
    defaultMessage: 'No linked norms.',
  },
});

const MateriaItem = ({ item }: { item: NormaMateriaRef }) => {
  const href = resolveEprocessosFacadePath(item?.['@id']) || undefined;
  const authors = Array.isArray(item?.autoria)
    ? item.autoria.map((a) => a.title).filter(Boolean)
    : [];

  return (
    <li>
      <Link item={href ?? null} title={item.title} defaultValue={item.title} />
      {authors.length ? <span> — {authors.join(', ')}</span> : null}
    </li>
  );
};

const NormaLinkedItem = ({ item }: { item: NormaSummary }) => {
  const href = item?.id ? `/normas/${item.id}` : undefined;
  return (
    <li>
      <Link item={href ?? null} title={item.title} defaultValue={item.title} />
    </li>
  );
};

/**
 * Norma view component.
 */
const NormaView = ({ content }: NormaViewProps) => {
  const intl = useIntl();

  if (!content) {
    return (
      <Container id="page-document" className="view-wrapper norma-view">
        <p>{intl.formatMessage(messages.error)}</p>
      </Container>
    );
  }

  const materias = Array.isArray(content.materia) ? content.materia : [];
  const linkedNormas = Array.isArray(content.normas_vinculadas)
    ? content.normas_vinculadas
    : [];

  const files = Array.isArray(content.file) ? content.file : [];
  const fullTextUrl = resolveEprocessosAssetUrl(files?.[0]?.download);

  const attachments = Array.isArray(content.anexos) ? content.anexos : [];
  const compiledText = Array.isArray(content.texto_compilado)
    ? content.texto_compilado
    : [];

  const primaryMateria = materias[0];
  const primaryMateriaHref = primaryMateria
    ? resolveEprocessosFacadePath(primaryMateria['@id'])
    : undefined;
  const primaryMateriaAuthors = Array.isArray(primaryMateria?.autoria)
    ? primaryMateria.autoria
        .map((a) => a?.title)
        .filter(Boolean)
        .join(', ')
    : '';

  const extraMaterias = materias.slice(1);

  return (
    <Container
      id="page-document"
      className="view-wrapper norma-view"
      width="default"
    >
      <header className="norma-header">
        <div className="norma-card">
          <div className="norma-card__top">
            <div className="norma-card__title">
              <h1 className="documentFirstHeading">{content.title}</h1>
            </div>
            <div className="norma-card__actions">
              {fullTextUrl ? (
                <a
                  className="norma-action"
                  href={fullTextUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {intl.formatMessage(messages.fullText)}
                </a>
              ) : null}
            </div>
          </div>

          {content.description ? (
            <h2 className="norma-card__ementa">{content.description}</h2>
          ) : null}

          <div className="norma-card__meta">
            {primaryMateria ? (
              <p>
                <strong>{intl.formatMessage(messages.originMatter)}:</strong>{' '}
                {primaryMateriaHref ? (
                  <Link
                    item={primaryMateriaHref}
                    title={primaryMateria.title}
                    defaultValue={primaryMateria.title}
                  />
                ) : (
                  <>{primaryMateria.title}</>
                )}
                {primaryMateriaAuthors ? (
                  <>
                    {' '}
                    — <strong>Autoria</strong>: {primaryMateriaAuthors}
                  </>
                ) : null}
              </p>
            ) : null}

            {content.data_norma ? (
              <p>
                <strong>{intl.formatMessage(messages.dateNorma)}:</strong>{' '}
                {content.data_norma}
              </p>
            ) : null}

            {content.data_publicacao ? (
              <p>
                <strong>{intl.formatMessage(messages.datePublication)}:</strong>{' '}
                {content.data_publicacao}
              </p>
            ) : null}

            {content.veiculo_publicacao ? (
              <p>
                <strong>
                  {intl.formatMessage(messages.publicationVehicle)}:
                </strong>{' '}
                {content.veiculo_publicacao}
              </p>
            ) : null}

            {content.status ? (
              <p>
                <strong>{intl.formatMessage(messages.status)}:</strong>{' '}
                {content.status}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      {attachments.length ? (
        <section className="norma-attachments">
          <h2>{intl.formatMessage(messages.attachments)}</h2>
          <FileAttachmentList items={attachments} />
        </section>
      ) : null}

      {compiledText.length ? (
        <section className="norma-compiled-text">
          <h2>{intl.formatMessage(messages.compiledText)}</h2>
          <FileAttachmentList items={compiledText} />
        </section>
      ) : null}

      {extraMaterias.length ? (
        <section className="norma-materias">
          <h2>{intl.formatMessage(messages.materias)}</h2>
          <ul>
            {extraMaterias.map((m) => (
              <MateriaItem key={m.id} item={m} />
            ))}
          </ul>
        </section>
      ) : null}

      {linkedNormas.length ? (
        <section className="norma-linked">
          <h2>{intl.formatMessage(messages.linkedNormas)}</h2>
          <ul>
            {linkedNormas.map((n) => (
              <NormaLinkedItem key={n.id} item={n} />
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
};

export default NormaView;
