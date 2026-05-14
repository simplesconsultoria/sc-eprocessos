import { useEffect, useRef, useState } from 'react';

import Icon from '@plone/volto/components/theme/Icon/Icon';
import personSVG from '@plone/volto/icons/user.svg';

interface AvatarProps {
  href?: string;
  src?: string;
  alt: string;
  size?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

const Avatar = ({
  href,
  src,
  alt,
  size,
  className,
  loading = 'lazy',
  fetchPriority,
}: AvatarProps) => {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  useEffect(() => {
    if (!src) return;
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  const wrapStyle =
    size != null
      ? ({ ['--eprocessos-avatar-size' as any]: size } as React.CSSProperties)
      : undefined;

  const iconSize = size || '2.5rem';
  const wrapperClass = ['eprocessos-avatar', className]
    .filter(Boolean)
    .join(' ');

  const imgSrc = src && src.startsWith('http') ? src : `${href}/${src}`;
  if (!src || failed) {
    return (
      <span className={wrapperClass} style={wrapStyle}>
        <Icon
          name={personSVG}
          className="eprocessos-avatar__placeholder"
          size={iconSize}
          style={{ width: iconSize }}
          ariaHidden={true}
        />
      </span>
    );
  }
  return (
    <span className={wrapperClass} style={wrapStyle}>
      <img
        ref={imgRef}
        className="eprocessos-avatar__img"
        src={imgSrc}
        alt={alt}
        onError={() => setFailed(true)}
        loading={loading}
        fetchPriority={fetchPriority}
      />
    </span>
  );
};

export default Avatar;
