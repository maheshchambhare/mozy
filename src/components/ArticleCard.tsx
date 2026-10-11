import { Link } from 'wouter';
import type { Article } from '../types/article';
export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  // Held articles are never linked, even if a caller passes one by mistake.
  if (article.editorial?.hold) return null;
  return <Link href={`/blog/${article.slug}`} className={`journal-card journal-color-${index % 3}`}><div className="journal-card-meta"><span>{article.pillarType.replaceAll('-', ' ')}</span><span>{article.seo.readTime}</span></div><h2>{article.seo.h1}</h2><p>{article.seo.metaDescription}</p><span className="journal-card-link">Read the story <span aria-hidden="true">↗</span></span></Link>;
}
