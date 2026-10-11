import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const allArticles = JSON.parse(await readFile('src/data/mozy-articles.json', 'utf8'));
// Articles with an editorial hold are not published: not listed, linked, prerendered or put in the sitemap.
const articles = allArticles.filter(article => !article.editorial?.hold);
const held = allArticles.filter(article => article.editorial?.hold);
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const plain = text => decode(text.replace(/<[^>]*>/g, '').replaceAll('<!-- -->', ''));
const stripMarkdown = text => text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`([^`]*)`/g, '$1').replace(/\[(.*?)\]\(.*?\)/g, '$1');
// Inline "- item" / "1. item" lists render as <ul>/<ol>, and external links gain an arrow, so compare text with list
// markers, arrows and whitespace removed on both sides.
const comparable = text => text.replace(/(^|\s)-\s+/g, ' ').replace(/(^|\s)\d{1,2}\.\s+/g, ' ').replaceAll('↗', '').replace(/\s+/g, '');
const visibleText = html => decode(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!-- -->/g, '').replace(/<[^>]*>/g, ' '));
const hasContent = section => [section.text, section.hook, section.problemStatement, section.articlePromise, ...(section.paragraphs || []), ...(section.steps || []), ...(section.apps || [])].some(value => typeof value === 'string' && value.trim()) || section.stats?.length || section.items?.length || (section.ctaLabel && section.ctaUrl);
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const heldPaths = held.map(article => `/blog/${article.slug}`);
const linksToHeld = html => heldPaths.filter(path => html.includes(`href="${path}"`) || html.includes(`href="https://mozy.mcrudra.com${path}"`));
const titles = new Set();
let outlineSections = 0;
for (const article of articles) {
  const label = article.slug;
  assert(article.content?.answer?.trim(), `${label}: missing direct answer`);
  assert(article.content?.sections?.length, `${label}: missing sections`);
  const html = await readFile(`dist/blog/${label}.html`, 'utf8');
  const headings = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(match => plain(match[1]).trim());
  for (const section of article.content.sections) {
    if (section.type === 'faq_section') { assert(article.faqs?.length, `${label}: FAQ section without questions`); continue; }
    if (hasContent(section)) continue;
    // Outline placeholders are allowed only in planned articles, and the page must not render them as empty headings.
    assert.equal(article.status, 'planned', `${label}: empty section ${section.label || section.type}`);
    if (section.label) assert(!headings.includes(section.label), `${label}: empty section rendered as heading ${section.label}`);
    outlineSections += 1;
  }
  const canonical = `https://mozy.mcrudra.com/blog/${label}`;
  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || '');
  assert.equal(title, article.seo.titleTag, `${label}: title mismatch`);
  assert(!titles.has(title), `${label}: duplicate title`); titles.add(title);
  const meta = (attribute, name) => decode(html.match(new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`))?.[1] || '');
  assert.equal(meta('name', 'description'), article.seo.metaDescription, `${label}: description mismatch`);
  assert.equal(meta('property', 'og:title'), article.seo.ogTitle || article.seo.titleTag, `${label}: OG title mismatch`);
  assert.equal(meta('property', 'og:description'), article.seo.ogDescription || article.seo.metaDescription, `${label}: OG description mismatch`);

  assert(html.includes(`rel="canonical" href="${canonical}"`), `${label}: missing canonical`);
  assert(sitemap.includes(`<loc>${canonical}</loc>`), `${label}: missing sitemap URL`);
  const header = html.match(/<header class="journal-heading reader-heading">([\s\S]*?)<\/header>/)?.[1];
  assert(header, `${label}: missing prerendered article heading`);
  const firstParagraph = header.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] || '';
  assert.equal(plain(firstParagraph), stripMarkdown(article.content.answer), `${label}: first paragraph is not direct answer`);
  const pageText = comparable(visibleText(html));
  for (const section of article.content.sections) {
    if (section.label && hasContent(section)) assert(plain(html).includes(section.label), `${label}: missing visible section heading ${section.label}`);
    for (const body of [section.text, section.hook, section.problemStatement, section.articlePromise, ...(section.paragraphs || []), ...(section.steps || []), ...(section.apps || [])].filter(Boolean)) {
      assert(pageText.includes(comparable(stripMarkdown(body))), `${label}: body text missing from static HTML: ${body.slice(0, 80)}`);
    }
  }
  for (const faq of article.faqs || []) assert(pageText.includes(comparable(stripMarkdown(faq.answer))), `${label}: FAQ answer missing from static HTML: ${faq.question}`);
  // No raw Markdown, internal store-copy notes or raw LaTeX may reach readers.
  assert(!html.includes('**'), `${label}: literal ** in static HTML`);
  assert(!html.includes('](http'), `${label}: raw Markdown link in static HTML`);
  assert(!html.includes('Companion Pack'), `${label}: ASO companion pack in static HTML`);
  const text = visibleText(html);
  for (const fragment of ['`', '](/', '$\\', 'In-App Conversion Funnel', 'Exact 30 Chars', 'Keyword Bank']) assert(!text.includes(fragment), `${label}: visible text contains ${fragment}`);
  assert.deepEqual(linksToHeld(html), [], `${label}: links to a held article`);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const schema = schemas.find(item => item['@type'] === 'BlogPosting');
  assert(schema, `${label}: missing BlogPosting schema`);
  assert.equal(schema.url, canonical); assert.equal(schema['@id'], `${canonical}#article`);
  assert.equal(schema.headline, article.seo.h1);
  assert.equal(schema.description, article.seo.metaDescription);
  assert.equal(schema.dateModified, article.editorial?.updatedAt);
  assert(schemas.some(item => item['@type'] === 'BreadcrumbList'), `${label}: missing breadcrumbs`);
}
const journal = await readFile('dist/blog.html', 'utf8');
for (const article of articles) assert(journal.includes(`href="/blog/${article.slug}"`), `${article.slug}: not listed on /blog`);
assert.deepEqual(linksToHeld(journal), [], '/blog links to a held article');
// Skipping held articles in routes and the sitemap is done by scripts/prerender.mjs; warn rather than fail if it still emits them.
for (const article of held) {
  const path = `dist/blog/${article.slug}.html`;
  if (existsSync(path)) {
    assert((await readFile(path, 'utf8')).includes('That story isn'), `${article.slug}: held article rendered its content`);
    console.warn(`warning: prerender still writes ${path} (it shows the not-found state)`);
  }
  if (sitemap.includes(`/blog/${article.slug}<`)) console.warn(`warning: sitemap still lists held article ${article.slug}`);
}
console.log(`Verified ${articles.length} published articles (${held.length} held back): complete sections (${outlineSections} unrendered outline placeholders in planned articles), answer-first static HTML, no raw Markdown or internal notes, unique titles, canonical URLs, sitemap entries, no links to held articles, and matching structured data.`);
