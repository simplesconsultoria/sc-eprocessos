import type { ReactNode } from 'react';

import { UniversalLink } from '@plone/volto/components';

import Avatar from '@simplesconsultoria/volto-eprocessos/components/Avatar/Avatar';

interface VereadorCardProps {
  href?: string;
  imageSrc?: string;
  name: string;
  party?: string;
  children?: ReactNode;
  className?: string;
}

const VereadorCard = ({
  href,
  imageSrc,
  name,
  party,
  children,
  className,
}: VereadorCardProps) => {
  const wrapperClass = ['vereador-outer', className].filter(Boolean).join(' ');

  const inner = (
    <div className="vereador-card">
      <div className="vereador-card-image">
        <Avatar
          src={imageSrc}
          alt={name}
          size="7.5rem"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className="vereador-card-body">
        <h4 className="vereador-card-title">{name}</h4>
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
