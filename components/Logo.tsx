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

const contextConfig: Record<string, { maxHeight: number }> = {
  navbar:  { maxHeight: 56 },
  sidebar: { maxHeight: 36 },
  footer:  { maxHeight: 52 },
};

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

  // Footer uses its own logo settings if they exist, otherwise falls back to the main logo
  const footerHasOwnLogo = !!(settings.footer_logo_url || settings.footer_logo_prefix || settings.footer_logo_suffix);

  const logoUrl = isFooter && footerHasOwnLogo ? (settings.footer_logo_url || '') : (settings.logo_url || '');
  const prefix = isFooter && footerHasOwnLogo ? (settings.footer_logo_prefix || '') : (settings.logo_prefix ?? 'GROUP');
  const suffix = isFooter && footerHasOwnLogo ? (settings.footer_logo_suffix || '') : (settings.logo_suffix ?? 'CONSULT');
  const baseSize = isFooter && footerHasOwnLogo
    ? parseInt(settings.footer_logo_size || '36', 10)
    : parseInt(settings.logo_size || '40', 10);

  const cfg = contextConfig[context] ?? contextConfig.navbar;
  const finalHeight = Math.min(baseSize, cfg.maxHeight);

  const showImage = logoUrl && !imgError;

  const content = showImage ? (
    <img
      src={logoUrl}
      alt={`${prefix}${suffix}`}
      style={{ height: `${finalHeight}px`, maxHeight: `${cfg.maxHeight}px` }}
      className={`w-auto object-contain block ${imgClass}`}
      onError={() => setImgError(true)}
    />
  ) : (
    <span
      className={`font-bold tracking-tight leading-none whitespace-nowrap block ${className}`}
      style={{ fontSize: `${finalHeight}px`, lineHeight: 1.1 }}
    >
      <span className={prefixClass}>{prefix}</span>{suffix}
    </span>
  );

  if (to) {
    return <Link to={to} className="inline-flex items-center max-w-full overflow-hidden">{content}</Link>;
  }

  return content;
};

export default Logo;
