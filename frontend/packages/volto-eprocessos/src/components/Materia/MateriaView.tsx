import { Container } from '@plone/components';
import { defineMessages, useIntl } from 'react-intl';
import type { ReactNode } from 'react';

import type {
  Materia,
  MateriaProcessing,
  MateriaVoteResult,
} from '@simplesconsultoria/volto-eprocessos/types';
import { DataCurta } from '@simplesconsultoria/volto-eprocessos/components/Widgets/Data';
import { FileAttachmentList } from '@simplesconsultoria/volto-eprocessos/components/FileAttachment/FileAttachment';
import { resolveEprocessosAssetUrl } from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';

interface MateriaViewProps {
  content?: Materia | null;
}

const messages = defineMessages({
  error: {
    id: 'Materia view error',
    defaultMessage: 'Could not load matter.',
  },
  inProgress: {
    id: 'Materia view in progress badge',
    defaultMessage: 'In progress',
  },
  date: {
    id: 'Materia view date label',
    defaultMessage: 'Date',
  },
  regime: {
    id: 'Materia view processing regime label',
    defaultMessage: 'Processing regime',
  },
  quorum: {
    id: 'Materia view quorum label',
    defaultMessage: 'Quorum',
  },
  authorship: {
    id: 'Materia view authorship heading',
    defaultMessage: 'Authorship',
  },
  noAuthorship: {
    id: 'Materia view no authorship',
    defaultMessage: 'No authorship information.',
  },
  files: {
    id: 'Materia view files heading',
    defaultMessage: 'Files',
  },
  accessoryDocs: {
    id: 'Materia view accessory documents heading',
    defaultMessage: 'Accessory documents',
  },
  voteResults: {
    id: 'Materia view vote results heading',
    defaultMessage: 'Vote results',
  },
  noVoteResults: {
    id: 'Materia view no vote results',
    defaultMessage: 'No vote results.',
  },
  amendments: {
    id: 'Materia view amendments heading',
    defaultMessage: 'Amendments',
  },
  noAmendments: {
    id: 'Materia view no amendments',
    defaultMessage: 'No amendments.',
  },
  attached: {
    id: 'Materia view attached heading',
    defaultMessage: 'Attached matters',
  },
  noAttached: {
    id: 'Materia view no attached',
    defaultMessage: 'No attached matters.',
  },
  substitutes: {
    id: 'Materia view substitutes heading',
    defaultMessage: 'Substitutes',
  },
  noSubstitutes: {
    id: 'Materia view no substitutes',
    defaultMessage: 'No substitutes.',
  },
  committeeOpinions: {
    id: 'Materia view committee opinions heading',
    defaultMessage: 'Committee opinions',
  },
  noCommitteeOpinions: {
    id: 'Materia view no committee opinions',
    defaultMessage: 'No committee opinions.',
  },
  noFiles: {
    id: 'Materia view no files',
    defaultMessage: 'No files.',
  },
  processing: {
    id: 'Materia view processing heading',
    defaultMessage: 'Processing history',
  },
  noProcessing: {
    id: 'Materia view no processing',
    defaultMessage: 'No processing history.',
  },
  textIntegral: {
    id: 'Materia view text integral button',
    defaultMessage: 'Full text',
  },
  authorshipInline: {
    id: 'Materia view authorship inline',
    defaultMessage: 'Authorship',
  },
  currentStatus: {
    id: 'Materia view current status heading',
    defaultMessage: 'Current status',
  },
  statusInProgress: {
    id: 'Materia view status in progress',
    defaultMessage: 'In progress',
  },
  statusClosed: {
    id: 'Materia view status closed',
    defaultMessage: 'Closed',
  },
  lastLocation: {
    id: 'Materia view last location label',
    defaultMessage: 'Last location',
  },
  digitalProposition: {
    id: 'Materia view digital proposition label',
    defaultMessage: 'Digital proposition',
  },
  protocol: {
    id: 'Materia view protocol label',
    defaultMessage: 'Protocol',
  },
});

const decodeHtmlEntitiesOnce = (value: string): string => {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_m, num) => String.fromCodePoint(parseInt(num, 10)));
};

const decodeHtmlEntities = (value: string, iterations = 2): string => {
  let current = value;
  for (let i = 0; i < iterations; i += 1) {
    const next = decodeHtmlEntitiesOnce(current);
    if (next === current) break;
    current = next;
  }
  return current;
};

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractProtocol = (
  processing: MateriaProcessing[],
): string | undefined => {
  const step = processing.find((p) =>
    (p.title || '').toLowerCase().includes('protocolo'),
  );
  if (!step?.description) return undefined;
  const decoded = decodeHtmlEntities(step.description);
  const plain = stripHtml(decoded);
  const match = plain.match(/protocolo\s*(?:n[ºo]\s*)?([0-9]+\/[0-9]{4})/i);
  return match?.[1];
};

const UnknownList = ({
  items,
  empty,
}: {
  items?: unknown[];
  empty: ReactNode;
}) => {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return <>{empty}</>;

  const labelOf = (it: any): string => {
    if (typeof it === 'string' || typeof it === 'number') return String(it);
    if (it?.title) return String(it.title);
    if (it?.description) return String(it.description);
    try {
      return JSON.stringify(it);
    } catch {
      return String(it);
    }
  };

  return (
    <ul>
      {list.map((it, idx) => (
        <li key={`unknown-${idx}`}>{labelOf(it)}</li>
      ))}
    </ul>
  );
};

const VoteResults = ({ items }: { items?: MateriaVoteResult[] }) => {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;

  const sorted = [...list].sort((a, b) =>
    (a.date || '').localeCompare(b.date || ''),
  );

  return (
    <ul className="materia-vote-results">
      {sorted.map((v, idx) => (
        <li key={`${v.date}-${v.result}-${idx}`}>
          <div className="materia-vote-results__title">
            <strong>{v.result || '-'}</strong>
            {v.date ? (
              <span className="materia-vote-results__date">
                <DataCurta date={v.date} defaultValue={v.date} />
              </span>
            ) : null}
          </div>
          <div className="materia-vote-results__counts">
            <span className="materia-badge materia-badge--success">
              Sim: {Number.isFinite(v.yes) ? v.yes : '-'}
            </span>
            <span className="materia-badge materia-badge--danger">
              Não: {Number.isFinite(v.no) ? v.no : '-'}
            </span>
            <span className="materia-badge materia-badge--primary">
              Abstenções: {Number.isFinite(v.abstention) ? v.abstention : '-'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

const ProcessingItem = ({ item }: { item: MateriaProcessing }) => {
  const description = item.description
    ? decodeHtmlEntities(item.description)
    : '';
  const hasHtml = description.includes('<');

  return (
    <li
      className={
        item.last ? 'processing-item processing-item-last' : 'processing-item'
      }
    >
      <div className="processing-item-header">
        <strong>{item.title}</strong>
        {item.date ? (
          <span className="processing-item-date">{item.date}</span>
        ) : null}
      </div>
      <div className="processing-item-units">
        {item.sourceUnit ? <span>{item.sourceUnit}</span> : null}
        {item.sourceUnit && item.destinationUnit ? <span> → </span> : null}
        {item.destinationUnit ? <span>{item.destinationUnit}</span> : null}
      </div>
      {description ? (
        hasHtml ? (
          <div
            className="processing-item-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <p className="processing-item-description">{description}</p>
        )
      ) : null}
      {Array.isArray(item.file) && item.file.length ? (
        <div className="processing-item-files">
          <FileAttachmentList items={item.file} />
        </div>
      ) : null}
    </li>
  );
};

/**
 * Materia view component.
 */
const MateriaView = ({ content }: MateriaViewProps) => {
  const intl = useIntl();

  if (!content) {
    return (
      <Container id="page-document" className="view-wrapper materia-view">
        <p>{intl.formatMessage(messages.error)}</p>
      </Container>
    );
  }

  const authors = Array.isArray(content.authorship) ? content.authorship : [];
  const authorsSorted = [...authors].sort((a, b) =>
    a.firstAuthor === b.firstAuthor ? 0 : a.firstAuthor ? -1 : 1,
  );

  const authorsInline = authorsSorted
    .map((a) => a?.title)
    .filter(Boolean)
    .join(', ');

  const files = Array.isArray(content.file) ? content.file : [];
  const mainFile = files[0];
  const mainFileUrl = resolveEprocessosAssetUrl(mainFile?.download);
  const extraFiles = files.slice(1);
  const filesList = mainFileUrl ? extraFiles : files;

  const processing = Array.isArray(content.processing)
    ? content.processing
    : [];
  const processingChronological = [...processing].sort((a, b) =>
    (a.date || '').localeCompare(b.date || ''),
  );
  const processingForDisplay = [...processingChronological].reverse();

  const lastProcessing =
    processingChronological.find((p) => p.last) ||
    processingChronological[processingChronological.length - 1];

  const protocol = extractProtocol(processingChronological);
  const digitalUrl = content.remoteUrl;

  const hasAccessoryDocs =
    Array.isArray(content.accessoryDocument) &&
    content.accessoryDocument.length;
  const hasVoteResults =
    Array.isArray(content.voteResult) && content.voteResult.length;
  const hasAmendments =
    Array.isArray(content.amendment) && content.amendment.length;
  const hasAttached =
    Array.isArray(content.attached) && content.attached.length;
  const hasSubstitutes =
    Array.isArray(content.substitute) && content.substitute.length;
  const hasCommitteeOpinions =
    Array.isArray(content.committeeOpinion) && content.committeeOpinion.length;

  return (
    <Container
      id="page-document"
      className="view-wrapper materia-view"
      width="default"
    >
      <section className="materia-card">
        <div className="materia-card__header">
          <div className="materia-card__title">
            <h1 className="documentFirstHeading">{content.title}</h1>
          </div>

          <div className="materia-card__actions">
            {mainFileUrl ? (
              <a
                className="materia-action"
                href={mainFileUrl}
                target="_blank"
                rel="noreferrer"
              >
                {intl.formatMessage(messages.textIntegral)}
              </a>
            ) : null}
          </div>
        </div>

        {content.description ? (
          <p className="materia-card__ementa">
            {content.description.charAt(0).toUpperCase() +
              content.description.slice(1)}
          </p>
        ) : null}

        <div className="materia-card__info">
          {authorsInline ? (
            <p className="materia-info-line">
              <strong>{intl.formatMessage(messages.authorshipInline)}:</strong>{' '}
              {authorsInline}
            </p>
          ) : null}

          {content.date ? (
            <p className="materia-info-line">
              <strong>{intl.formatMessage(messages.date)}:</strong>{' '}
              <DataCurta date={content.date} defaultValue="-" />
            </p>
          ) : null}

          {digitalUrl ? (
            <p className="materia-info-line">
              <strong>
                {intl.formatMessage(messages.digitalProposition)}:
              </strong>{' '}
              <a href={digitalUrl} target="_blank" rel="noreferrer">
                {digitalUrl}
              </a>
            </p>
          ) : null}

          {protocol ? (
            <p className="materia-info-line">
              <strong>{intl.formatMessage(messages.protocol)}:</strong>{' '}
              {protocol}
            </p>
          ) : null}

          {content.quorum ? (
            <p className="materia-info-line">
              <strong>{intl.formatMessage(messages.quorum)}:</strong>{' '}
              {content.quorum}
            </p>
          ) : null}

          {content.processingRegime ? (
            <p className="materia-info-line">
              <strong>{intl.formatMessage(messages.regime)}:</strong>{' '}
              {content.processingRegime}
            </p>
          ) : null}
        </div>

        {processingChronological.length ? (
          <div className="materia-card__status">
            <div className="materia-status-header">
              <span className="materia-status-title">
                {intl.formatMessage(messages.currentStatus)}
              </span>
              <span
                className={
                  content.inProgress
                    ? 'materia-badge materia-badge--warning'
                    : 'materia-badge materia-badge--success'
                }
              >
                {content.inProgress
                  ? intl.formatMessage(messages.statusInProgress)
                  : intl.formatMessage(messages.statusClosed)}
              </span>
            </div>

            {lastProcessing ? (
              <div className="materia-status-card">
                <p className="materia-status-line">
                  <strong>{intl.formatMessage(messages.lastLocation)}:</strong>{' '}
                  {lastProcessing.date ? (
                    <span>{lastProcessing.date}</span>
                  ) : null}
                  {lastProcessing.destinationUnit ? (
                    <span> — {lastProcessing.destinationUnit}</span>
                  ) : null}
                </p>
                <div className="materia-status-files">
                  {lastProcessing.title ? (
                    <div className="materia-status-step">
                      <strong>{lastProcessing.title}</strong>
                    </div>
                  ) : null}
                  {Array.isArray(lastProcessing.file) &&
                  lastProcessing.file.length ? (
                    <FileAttachmentList items={lastProcessing.file} />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {filesList.length ? (
          <div className="materia-card__extra-files">
            <h2 className="materia-section-title">
              {intl.formatMessage(messages.files)}
            </h2>
            <FileAttachmentList items={filesList} />
          </div>
        ) : null}

        {hasAccessoryDocs ? (
          <div className="materia-card__attachments">
            <h2 className="materia-section-title">
              {intl.formatMessage(messages.accessoryDocs)}
            </h2>
            <FileAttachmentList items={content.accessoryDocument} />
          </div>
        ) : null}
      </section>

      {hasVoteResults ? (
        <section className="materia-votes">
          <h2>{intl.formatMessage(messages.voteResults)}</h2>
          <VoteResults items={content.voteResult} />
        </section>
      ) : null}

      {hasAmendments ? (
        <section className="materia-amendments">
          <h2>{intl.formatMessage(messages.amendments)}</h2>
          <UnknownList items={content.amendment} empty={null} />
        </section>
      ) : null}

      {hasAttached ? (
        <section className="materia-attached">
          <h2>{intl.formatMessage(messages.attached)}</h2>
          <UnknownList items={content.attached} empty={null} />
        </section>
      ) : null}

      {hasSubstitutes ? (
        <section className="materia-substitutes">
          <h2>{intl.formatMessage(messages.substitutes)}</h2>
          <UnknownList items={content.substitute} empty={null} />
        </section>
      ) : null}

      {hasCommitteeOpinions ? (
        <section className="materia-committee-opinions">
          <h2>{intl.formatMessage(messages.committeeOpinions)}</h2>
          <UnknownList items={content.committeeOpinion} empty={null} />
        </section>
      ) : null}

      {processingForDisplay.length ? (
        <section className="materia-processing">
          <h2>{intl.formatMessage(messages.processing)}</h2>
          <ol className="processing-list">
            {processingForDisplay.map((p, idx) => (
              <ProcessingItem key={`${p.date}-${p.title}-${idx}`} item={p} />
            ))}
          </ol>
        </section>
      ) : null}
    </Container>
  );
};

export default MateriaView;
