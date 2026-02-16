import React from 'react';
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

const contextConfig: Record<string, { scale: number; maxHeight: number }> = {
  navbar:  { scale: 1,    maxHeight: 56 },
  sidebar: { scale: 0.70, maxHeight: 36 },
  footer:  { scale: 0.80, maxHeight: 44 },
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

  const logoUrl = settings.logo_url;
  const prefix = settings.logo_prefix ?? 'GROUP';
  const suffix = settings.logo_suffix ?? 'CONSULT';

  const baseSize = parseInt(settings.logo_size || '40', 10);
  const cfg = contextConfig[context] ?? contextConfig.navbar;
  const finalHeight = Math.min(Math.round(baseSize * cfg.scale), cfg.maxHeight);

  const content = logoUrl ? (
    <img
      src={logoUrl}
      alt={`${prefix}${suffix}`}
      style={{ height: `${finalHeight}px`, maxHeight: `${cfg.maxHeight}px` }}
      className={`w-auto object-contain block ${imgClass}`}
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
    return <Link to={to} className="inline-flex items-center">{content}</Link>;
  }

  return content;
};

export default Logo;
