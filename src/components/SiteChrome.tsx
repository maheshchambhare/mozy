import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { useCtaAttributes, useStoreHref } from '../hooks/usePlatform';
import { ArrowUpRight } from './story/icons';
import { Logo } from './Logo';
import { RippleMenu } from './RippleMenu';
import '../story-nav.css';

const navLinks = [['/#how', 'How it works'], ['/#worlds', 'Worlds'], ['/pricing', 'Pricing'], ['/blog', 'Journal'], ['/#faq', 'FAQ']] as const;

// Hash targets live on the landing page, so they stay plain anchors; routes use the client router.
function SiteLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return href.includes('#') ? <a href={href} className={className}>{children}</a> : <Link href={href} className={className}>{children}</Link>;
}

export function SiteHeader() {
  const cta = useStoreHref('NAV', '/#get');
  const ctaAttributes = useCtaAttributes('NAV');
  const menuCta = useStoreHref('MENU', '/#get');
  const menuCtaAttributes = useCtaAttributes('MENU');
  return (
    <header className="st-header">
      <nav className="st-nav" aria-label="Main navigation">
        <Logo />
        <div className="st-nav-links">{navLinks.map(([href, label]) => <SiteLink key={href} href={href} className="st-nav-link">{label}</SiteLink>)}</div>
        <div className="st-nav-actions">
          <RippleMenu cta={menuCta} ctaAttributes={menuCtaAttributes} />
          <a className="st-nav-cta" href={cta} {...ctaAttributes}>Get Mozy <ArrowUpRight size={16} /></a>
        </div>
      </nav>
    </header>
  );
}

export { SiteFooter } from './SiteFooter';
