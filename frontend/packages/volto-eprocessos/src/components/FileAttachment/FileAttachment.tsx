import { defineMessages, useIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import attachmentSVG from '@plone/volto/icons/attachment.svg';
import type { FileAttachment as FileAttachmentType } from '@simplesconsultoria/volto-eprocessos/types';
import { resolveEprocessosAssetUrl } from '@simplesconsultoria/volto-eprocessos/helpers/eprocessosAssets';

interface FileAttachmentProps {
  item: FileAttachmentType;
  className?: string;
}

const messages = defineMessages({
  download: {
    id: 'File attachment download',
    defaultMessage: 'Download',
  },
  opensInNewWindow: {
    id: 'Opens in a new window',
    defaultMessage: 'abre em uma nova janela',
  },
  pdfWarning: {
    id: 'PDF document warning',
    defaultMessage:
      'Este documento PDF pode ter limitações de acessibilidade e requer um programa externo para visualização.',
  },
});

const resolveDownloadUrl = (attachment?: FileAttachmentType | null): string => {
  const raw = attachment?.download;
  return resolveEprocessosAssetUrl(raw) || raw || '';
};

const FileAttachment = ({ item, className }: FileAttachmentProps) => {
  const intl = useIntl();

  const href = resolveDownloadUrl(item);
  const isPDF =
    item?.['content-type'] === 'application/pdf' ||
    href.toLowerCase().endsWith('.pdf');

  const label = item?.filename || intl.formatMessage(messages.download);
  const pdfSuffix = isPDF ? ' (PDF)' : '';

  const classes = ['eprocessos-file-attachment', className]
    .filter(Boolean)
    .join(' ');

  // Constrói um aria-label completo para tecnologias assistivas
  const ariaLabel = `${intl.formatMessage(messages.download)}: ${label}${pdfSuffix}. ${intl.formatMessage(messages.opensInNewWindow)}.`;

  return (
    <div className={classes}>
      <Icon
        name={attachmentSVG}
        size="1rem"
        className="eprocessos-file-attachment__icon"
        ariaHidden={true}
      />
      {href ? (
        <>
          <a
            className="eprocessos-file-attachment__link"
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={ariaLabel}
            title={isPDF ? intl.formatMessage(messages.pdfWarning) : undefined}
          >
            {label + ' ' + pdfSuffix}
          </a>
        </>
      ) : (
        <span className="eprocessos-file-attachment__label">{label}</span>
      )}
      {item?.['content-type'] ? (
        <span className="eprocessos-file-attachment__meta">
          {item['content-type']}
        </span>
      ) : null}
    </div>
  );
};

export const FileAttachmentList = ({
  items,
  empty,
  className,
}: {
  items?: FileAttachmentType[];
  empty?: React.ReactNode;
  className?: string;
}) => {
  const list = Array.isArray(items) ? items : [];

  if (!list.length) return <>{empty ?? null}</>;

  return (
    <div
      className={['eprocessos-file-attachment-list', className]
        .filter(Boolean)
        .join(' ')}
    >
      {list.map((item, idx) => (
        <FileAttachment
          key={`${item.download || item.filename || 'file'}-${idx}`}
          item={item}
        />
      ))}
    </div>
  );
};

export default FileAttachment;
