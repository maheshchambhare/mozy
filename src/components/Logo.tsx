import { Link } from 'wouter';

/** The MOZY wordmark with the app icon, linking home. Shared by the header and the footer. */
export function Logo() {
  return <Link href="/" className="st-logo" aria-label="MOZY home"><img src="/assets/story/app-icon-96.webp" alt="" width="36" height="36" /><span>MOZY</span></Link>;
}
