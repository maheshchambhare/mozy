import { Fragment, useRef } from 'react';
import { COMPANY, FOUNDER } from '../data/company';
import type { ReactNode } from 'react';
import { Link, useParams } from 'wouter';
import type { Section } from '../types/article';
import { articles } from '../data/articles';
import { ArticleCard } from '../components/ArticleCard';
import NotFoundPage from './NotFoundPage';
import { useJournalMotion } from '../hooks/useJournalMotion';
import '../journal.css';
import { siteUrl, socialImage } from '../data/metadata';
function safeLink(href: string) {
  if ([...href].some(character => character.charCodeAt(0) <= 32 || character === '\\')) return false;
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  try { return ['http:', 'https:'].includes(new URL(href).protocol); } catch { return false; }
}
// Article copy is a small Markdown subset (**bold**, *italic*, `code`, [label](url) and inline "- item" / "1. item" lists).
// It is turned into React nodes only; supplied article HTML is never executed and links must pass safeLink().
const MARKDOWN_LINK = /^\[([^\]\n]+)\]\(([^()\s]+)\)/;
function closingStar(text: string, from: number) {
  for (let index = from; index < text.length; index += 1) {
    if (text[index] !== '*') continue;
    if (text[index + 1] === '*') { index += 1; continue; } // a **bold** run inside *italic* text
    return index;
  }
  return -1;
}
function renderLink(label: string, href: string, key: string): ReactNode {
  const text = parseInline(label, key, false);
  if (!safeLink(href)) return <Fragment key={key}>{text}</Fragment>;
  return href.startsWith('/') ? (
    <Link key={key} href={href} className="journal-inline-link">{text}</Link>
  ) : (
    <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="journal-inline-link">{text} ↗</a>
  );
}
function parseInline(text: string, keyPrefix: string, allowLinks = true): ReactNode[] {
  const nodes: ReactNode[] = [];
  let plain = '';
  const flush = () => { if (plain) { nodes.push(plain); plain = ''; } };
  const nextKey = () => `${keyPrefix}.${nodes.length}`;
  let index = 0;
  while (index < text.length) {
    const character = text[index];
    if (character === '`') {
      const end = text.indexOf('`', index + 1);
      if (end > index + 1) { flush(); nodes.push(<code key={nextKey()}>{text.slice(index + 1, end)}</code>); index = end + 1; continue; }
    } else if (text.startsWith('**', index)) {
      const end = text.indexOf('**', index + 2);
      if (end > index + 2) { flush(); const key = nextKey(); nodes.push(<strong key={key}>{parseInline(text.slice(index + 2, end), key, allowLinks)}</strong>); index = end + 2; continue; }
    } else if (character === '*') {
      const end = closingStar(text, index + 1);
      if (end > index + 1) { flush(); const key = nextKey(); nodes.push(<em key={key}>{parseInline(text.slice(index + 1, end), key, allowLinks)}</em>); index = end + 1; continue; }
    } else if (character === '[' && allowLinks) {
      const match = MARKDOWN_LINK.exec(text.slice(index));
      if (match) { flush(); nodes.push(renderLink(match[1], match[2], nextKey())); index += match[0].length; continue; }
    }
    plain += character;
    index += 1;
  }
  flush();
  return nodes;
}
function Inline({ text }: { text: string }) {
  return <>{parseInline(text, 'i')}</>;
}
// A paragraph such as "Lead: - one - two" or "Lead: 1. one 2. two" is really a list.
function splitList(source: string): { lead: string; ordered: boolean; items: string[] } | null {
  const text = source.trim();
  const startsWithBullet = text.startsWith('- ');
  const colonBullet = text.search(/:\s+-\s+/);
  if (startsWithBullet || colonBullet >= 0) {
    const listAt = startsWithBullet ? 0 : colonBullet + 1;
    const items = text.slice(listAt).trim().replace(/^-\s+/, '').split(/\s+-\s+/).map(item => item.trim()).filter(Boolean);
    if (items.length > 1 || startsWithBullet) return { lead: text.slice(0, listAt).trim(), ordered: false, items };
  }
  const starts: number[] = [];
  for (const marker of text.matchAll(/(^|\s)(\d{1,2})\.\s+/g)) {
    if (Number(marker[2]) === starts.length + 1) starts.push((marker.index ?? 0) + marker[1].length);
  }
  if (starts.length < 2) return null;
  const items = starts.map((start, index) => text.slice(start, starts[index + 1] ?? text.length).replace(/^\d{1,2}\.\s+/, '').trim());
  return { lead: text.slice(0, starts[0]).trim(), ordered: true, items };
}
function RichText({ text, inline = false, depth = 0 }: { text: string; inline?: boolean; depth?: number }) {
  const list = depth < 3 ? splitList(text) : null;
  const block = (value: string) => (inline ? <Inline text={value} /> : <p><Inline text={value} /></p>);
  if (!list) return block(text);
  const items = list.items.map((item, index) => <li key={index}><RichText text={item} inline depth={depth + 1} /></li>);
  // A list item that is nothing but a list (a protocol step's "Setup / How often / Why" lines) reads as labelled lines.
  const className = inline && !list.lead ? 'reader-sublist' : undefined;
  return <>{list.lead ? block(list.lead) : null}{list.ordered ? <ol className={className}>{items}</ol> : <ul className={className}>{items}</ul>}</>;
}
function hasBody(section: Section) {
  return Boolean(section.text || section.paragraphs?.length || section.steps?.length || section.stats?.length || section.hook || section.problemStatement || section.articlePromise || section.items?.length || section.apps?.length || (section.ctaLabel && section.ctaUrl));
}
export default function BlogPost({ slug: suppliedSlug }: { slug?: string }) {
  const params = useParams<{ slug: string }>();
  const slug = suppliedSlug ?? params.slug;
  const root = useRef<HTMLElement>(null);
  useJournalMotion(root, slug ?? '');
  // `articles` excludes held stories, so a held slug falls through to this not-found state.
  const article = articles.find(item => item.slug === slug);
  if (!article) return <NotFoundPage variant="story" />;
  const sections = (article.content?.sections ?? []).filter(hasBody);
  const related = articles.filter(item => item.id !== article.id).sort((a, b) => Number(b.pillarType === article.pillarType) - Number(a.pillarType === article.pillarType)).slice(0, 3);
  const canonical = `${siteUrl}/blog/${article.slug}`;
  const updatedAt = article.editorial?.updatedAt;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    headline: article.seo.h1,
    description: article.seo.metaDescription,
    url: canonical,
    mainEntityOfPage: canonical,
    image: socialImage,
    inLanguage: 'en-US',
    ...(article.schema?.article?.datePublished ? { datePublished: article.schema.article.datePublished } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    author: { '@type': 'Organization', '@id': `${siteUrl}/blog#journal`, name: 'MOZY Journal', url: `${siteUrl}/blog` },
    publisher: { '@type': 'Organization', '@id': COMPANY.id, name: COMPANY.name, url: COMPANY.url, founder: { '@type': 'Person', '@id': FOUNDER.id, name: FOUNDER.name } },
  };
  const breadcrumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumbs`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'MOZY Journal', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: article.seo.h1, item: canonical },
    ],
  };
  return <main className="reader lp-wrap" ref={root} id="main"><script type="application/ld+json">{JSON.stringify(schema).replaceAll('<', '\\u003c')}</script><script type="application/ld+json">{JSON.stringify(breadcrumbs).replaceAll('<', '\\u003c')}</script><nav className="reader-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog">Journal</Link><span>/</span><span>Article</span></nav><article><header className="journal-heading reader-heading"><span className="lp-eyebrow">{article.pillarType.replaceAll('-', ' ')}</span><h1>{article.seo.h1}</h1><p className="reader-answer"><Inline text={article.content?.answer || article.seo.metaDescription} /></p><div className="reader-meta"><span>MOZY Journal</span>{updatedAt ? <><span>·</span><span>Updated <time dateTime={updatedAt}>{new Date(`${updatedAt.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</time></span></> : null}<span>·</span><span>{article.seo.readTime}</span></div><p className="reader-disclosure">Published by <a href={COMPANY.url}>{COMPANY.name}</a>, the studio behind Mozy, founded by {FOUNDER.name}.{article.editorial?.reviewedBy ? ` Editorial review: ${article.editorial.reviewedBy}.` : ''}</p></header><div className="reader-layout"><aside className="reader-toc"><nav aria-label="On this page"><span className="lp-eyebrow">IN THIS STORY</span>{sections.map((section, index) => section.label ? <a href={`#${section.anchor || `section-${index}`}`} key={index}>{section.label}</a> : null)}{article.faqs?.length ? <a href="#article-faq">Questions & answers</a> : null}<Link href="/blog" className="reader-back">← All stories</Link></nav></aside><div className="reader-body">{sections.map((section, index) => <section className={`reader-section ${section.type === 'tldr_block' ? 'reader-takeaway' : ''}`} id={section.anchor || `section-${index}`} key={index}>{section.label ? <h2>{section.label}</h2> : section.type === 'tldr_block' ? <h2>The quick read</h2> : null}{[section.text, section.hook, section.problemStatement, section.articlePromise, ...(section.paragraphs ?? [])].filter(Boolean).map((text, i) => <RichText key={i} text={text!} />)}{section.apps?.length ? <ul>{section.apps.map((app, i) => <li key={i}><RichText text={app} inline /></li>)}</ul> : null}{section.ctaLabel && section.ctaUrl && safeLink(section.ctaUrl) ? <a href={section.ctaUrl} className="journal-inline-link">{section.ctaLabel}</a> : null}{section.stats?.length ? <div className="reader-stats">{section.stats.map((stat, i) => <div key={i}><strong>{stat.value}</strong><p>{stat.label}</p><small>Source: {stat.source}</small></div>)}</div> : null}{section.steps?.length ? <ol>{section.steps.map((step, i) => <li key={i}><RichText text={step} inline /></li>)}</ol> : null}{section.items?.length ? <div className="reader-table" tabIndex={0} role="region" aria-label={section.label || "Comparison table"}><table><thead><tr>{Object.keys(section.items[0]).map(key => <th scope="col" key={key}>{key.replace(/([A-Z])/g, " $1")}</th>)}</tr></thead><tbody>{section.items.map((item, i) => <tr key={i}>{Object.keys(section.items![0]).map(key => <td key={key}>{typeof item[key] === "boolean" ? item[key] ? "Yes" : "No" : typeof item[key] === "string" ? <Inline text={item[key]} /> : item[key]}</td>)}</tr>)}</tbody></table></div> : null}</section>)}{article.faqs?.length ? <section id="article-faq" className="reader-section reader-faq"><h2>Questions & answers</h2>{article.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><RichText text={faq.answer} /></details>)}</section> : null}{article.citations?.length ? <section className="reader-section reader-references"><h2>References</h2><ol>{article.citations.map((citation, i) => <li key={i}><strong>{citation.author}{citation.year ? ` (${citation.year})` : ''}</strong>. <em>{citation.url && safeLink(citation.url) ? <a href={citation.url} className="journal-inline-link" target="_blank" rel="noopener noreferrer">{citation.title}</a> : citation.title}</em>. {citation.journal || citation.publisher}{citation.accessedAt ? ` Accessed ${citation.accessedAt}.` : ''}</li>)}</ol></section> : null}<aside className="reader-download"><span className="lp-eyebrow">MAKE A LITTLE ROOM FOR LIFE</span><h2>Put a little movement<br />before your next scroll.</h2><p>MOZY turns your steps into screen time for the apps you choose.</p><a href="/#get" className="lp-button">Get MOZY ↗</a></aside></div></div></article><section className="reader-related"><span className="lp-eyebrow">KEEP EXPLORING</span><h2>Your next little read.</h2><div className="journal-grid">{related.map((item, index) => <ArticleCard article={item} key={item.id} index={index} />)}</div></section></main>;
}
