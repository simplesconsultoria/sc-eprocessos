import type { ReactNode } from 'react';

import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';

import Avatar from '@simplesconsultoria/volto-eprocessos/components/Avatar/Avatar';

interface VereadorCardProps {
  href?: string;
  imageSrc?: string;
  name: string;
  party?: string;
  header?: ReactNode;
  avatarSize?: string;
  avatarLoading?: 'lazy' | 'eager';
  avatarFetchPriority?: 'high' | 'low' | 'auto';
  children?: ReactNode;
  className?: string;
}

const VereadorCard = ({
  href,
  imageSrc,
  name,
  party,
  header,
  avatarSize,
  avatarLoading = 'lazy',
  avatarFetchPriority,
  children,
  className,
}: VereadorCardProps) => {
  const wrapperClass = ['vereador-outer', className].filter(Boolean).join(' ');
  const inner = (
    <div className="vereador-card">
      {header ? <div className="vereador-card-header">{header}</div> : null}
      <div className="vereador-card-image">
        <Avatar
          href={href}
          src={imageSrc}
          alt={name}
          size={avatarSize || '7.5rem'}
          loading={avatarLoading}
          fetchPriority={avatarFetchPriority}
        />
      </div>
      <div className="vereador-card-body">
        <h3 className="vereador-card-title">{name}</h3>
        {party ? <p className="vereador-card-party">{party}</p> : null}
        {children}
      </div>
    </div>
  );

  return href ? (
    <UniversalLink href={href} className={wrapperClass} title={name}>
      {inner}
    </UniversalLink>
  ) : (
    <div className={wrapperClass}>{inner}</div>
  );
};

export default VereadorCard;
