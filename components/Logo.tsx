import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../lib/useSiteSettings';

interface LogoProps {
  to?: string;
  className?: string;
  prefixClass?: string;
  suffixClass?: string;
  context?: 'navbar' | 'sidebar' | 'footer';
  imgClass?: string;
}

const Logo: React.FC<LogoProps> = ({
  to = '/',
  className = '',
  prefixClass = 'text-slate-500',
  suffixClass = '',
  context = 'navbar',
  imgClass = '',
}) => {
  const { settings } = useSiteSettings();
  const [imgError, setImgError] = useState(false);

  const isFooter = context === 'footer';
  const isSidebar = context === 'sidebar';

  const footerHasOwnLogo = !!(settings.footer_logo_url || settings.footer_logo_prefix || settings.footer_logo_suffix);

  const logoUrl = isFooter && footerHasOwnLogo ? (settings.footer_logo_url || '') : (settings.logo_url || '');
  const prefix = isFooter && footerHasOwnLogo ? (settings.footer_logo_prefix || '') : (settings.logo_prefix ?? 'GROUP');
  const suffix = isFooter && footerHasOwnLogo ? (settings.footer_logo_suffix || '') : (settings.logo_suffix ?? 'CONSULT');

  // logo_size controls WIDTH for images, FONT-SIZE for text
  const size = isFooter && footerHasOwnLogo
    ? parseInt(settings.footer_logo_size || '160', 10)
    : parseInt(settings.logo_size || '160', 10);

  const scale = isSidebar ? 0.55 : 1;
  const finalSize = Math.round(size * scale);

  const showImage = logoUrl && !imgError;

  const content = showImage ? (
    // IMAGE logo: size = width, height auto (proportional)
    <img
      src={logoUrl}
      alt={`${prefix}${suffix}`}
      style={{ width: `${finalSize}px` }}
      className={`h-auto object-contain block max-w-full max-h-full ${imgClass}`}
      onError={() => setImgError(true)}
    />
  ) : (
    // TEXT logo: size = font-size
    <span
      className={`font-bold tracking-tight leading-none whitespace-nowrap block overflow-hidden text-ellipsis ${className}`}
      style={{ fontSize: `${finalSize}px`, lineHeight: 1.1 }}
    >
      <span className={prefixClass}>{prefix}</span>{suffix}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center max-w-full max-h-full">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
