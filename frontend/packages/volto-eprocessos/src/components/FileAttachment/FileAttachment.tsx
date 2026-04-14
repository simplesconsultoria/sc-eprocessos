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
});

const resolveDownloadUrl = (attachment?: FileAttachmentType | null): string => {
  const raw = attachment?.download;
  return resolveEprocessosAssetUrl(raw) || raw || '';
};

const FileAttachment = ({ item, className }: FileAttachmentProps) => {
  const intl = useIntl();

  const href = resolveDownloadUrl(item);
  const label = item?.filename || href || intl.formatMessage(messages.download);

  const classes = ['eprocessos-file-attachment', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <Icon
        name={attachmentSVG}
        size="1rem"
        className="eprocessos-file-attachment__icon"
        ariaHidden={true}
      />
      {href ? (
        <a
          className="eprocessos-file-attachment__link"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {label}
        </a>
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
