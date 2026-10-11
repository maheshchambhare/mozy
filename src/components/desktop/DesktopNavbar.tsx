
interface DesktopNavbarProps {
  onDownloadClick?: () => void;
}

export default function DesktopNavbar({ onDownloadClick }: DesktopNavbarProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="mozy-desktop-navbar-wrap">
      <div className="mozy-desktop-navbar">
        {/* Brand Logo */}
        <a href="/" className="mozy-navbar-brand">
          <span className="brand-logo-text">MOZY</span>
        </a>

        {/* Navigation Links */}
        <nav className="mozy-navbar-nav">
          <button type="button" onClick={() => scrollTo("why-mozy")} className="navbar-link">
            Why MOZY
          </button>
          <button type="button" onClick={() => scrollTo("features")} className="navbar-link">
            Features
          </button>
          <button type="button" onClick={() => scrollTo("reviews")} className="navbar-link">
            Reviews
          </button>
          <button type="button" onClick={() => scrollTo("faq")} className="navbar-link">
            FAQ
          </button>
        </nav>

        {/* CTA Download Button */}
        <div className="mozy-navbar-action">
          <a
            href="#download"
            onClick={(e) => {
              e.preventDefault();
              if (onDownloadClick) onDownloadClick();
              else scrollTo("download");
            }}
            className="navbar-cta-pill"
          >
            Download App
          </a>
        </div>
      </div>
    </header>
  );
}
