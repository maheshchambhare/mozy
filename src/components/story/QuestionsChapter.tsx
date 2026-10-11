import { Link } from 'wouter';
import { COMPANY, FOUNDER } from '../../data/company';
import { faqs } from '../../data/landing';
import { ArrowUpRight, Plus, Shield } from './icons';
import '../../story-qa.css';

// Two balanced columns: the first four questions, then the last three plus the "still wondering" card.
const SPLIT = 4;

const Mail = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></svg>
);

function Question({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="st-qa-item" name="mozy-faq">
      <summary><span>{question}</span><span className="st-qa-toggle" aria-hidden="true"><Plus size={18} /></span></summary>
      <p>{answer}</p>
    </details>
  );
}

/**
 * Questions: a centred header, the FAQ as cards in two balanced columns (one open at a time), then the two trust
 * notes side by side: privacy, and the maker card (#maker, the Person in the page's JSON-LD).
 */
export function QuestionsChapter() {
  const columns = [faqs.slice(0, SPLIT), faqs.slice(SPLIT)];
  return (
    <section className="st-qa" id="faq" aria-labelledby="faq-title">
      <div className="st-wrap st-qa-inner">
        <header className="st-qa-head st-reveal">
          <p className="st-qa-chip"><span aria-hidden="true">?</span>Questions</p>
          <h2 id="faq-title" className="st-qa-title">Quick <span className="st-qa-accent">answers.<svg viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 C 40 2, 80 15, 120 8 S 200 3, 237 10" /></svg></span></h2>
          <p className="st-qa-lede">What people ask before they let Mozy hold the keys to their apps.</p>
        </header>

        <div className="st-qa-faq">
          {columns.map((column, index) => (
            <div className="st-qa-col" key={index}>
              {column.map(([question, answer]) => <Question key={question} question={question} answer={answer} />)}
              {index === 1 ? (
                <div className="st-qa-ask">
                  <span className="st-qa-ask-icon"><Mail /></span>
                  <div className="st-qa-ask-text">
                    <p className="st-qa-ask-title">Still wondering?</p>
                    <p>Questions and ideas go straight to {FOUNDER.name.split(' ')[0]}.</p>
                  </div>
                  <a className="st-qa-ask-link" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="st-qa-trust">
          <article className="st-qa-card is-privacy st-reveal" id="privacy">
            <span className="st-qa-card-icon"><Shield size={26} /></span>
            <h3>Your steps stay on your phone.</h3>
            <p>No account to create. No GPS. Your step counts and the apps you lock never leave your phone. Anonymous analytics help us improve Mozy, and we never sell data or show ads.</p>
            <Link href="/privacy" className="st-qa-link">Read the privacy policy <ArrowUpRight size={14} /></Link>
          </article>

          <article className="st-qa-card is-founder st-reveal" id="maker" aria-labelledby="maker-name">
            <img className="st-maker-photo" src={FOUNDER.photo} alt={`${FOUNDER.name}, founder of ${COMPANY.name} and the maker of Mozy`} width="96" height="96" loading="lazy" decoding="async" />
            <div className="st-maker-body">
              <p className="st-maker-kicker">Made by one indie developer</p>
              <h3 id="maker-name">{FOUNDER.name}</h3>
              <p className="st-maker-role">Founder of <a href={COMPANY.url}>{COMPANY.name}</a></p>
              <p className="st-maker-bio">Mahesh builds Mozy at {COMPANY.name}, a small studio with one promise: use tech without letting it use you.</p>
              <ul className="st-maker-links" aria-label={`Find ${FOUNDER.name} and ${COMPANY.name}`}>
                <li><a href={COMPANY.url}>{COMPANY.name}<ArrowUpRight size={13} /></a></li>
                {FOUNDER.social.map(([label, handle, href]) => <li key={label}><a href={href} rel="me noopener" target="_blank" aria-label={`${FOUNDER.name} on ${label}`}>{label === 'X' ? `X ${handle}` : label}</a></li>)}
                <li><a href={COMPANY.social[0][2]} rel="me noopener" target="_blank" aria-label={`${COMPANY.name} on Instagram`}>Instagram {COMPANY.social[0][1]}</a></li>
                <li><a href="https://www.producthunt.com/products/mozy-walk-to-unlock-apps" target="_blank" rel="noopener">Product Hunt</a></li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
