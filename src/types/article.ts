export interface StatItem {
  value: string;
  label: string;
  source: string;
}

export interface Section {
  type: string;
  hook?: string;
  problemStatement?: string;
  articlePromise?: string;
  items?: Record<string, string | number | boolean>[];
  label?: string;
  anchor?: string;
  text?: string;
  paragraphs?: string[];
  stats?: StatItem[];
  /** Ordered list items (rendered as <ol>). */
  steps?: string[];
  /** Unordered list items (rendered as <ul>). */
  apps?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Citation {
  author: string;
  year?: number;
  accessedAt?: string;
  title: string;
  journal?: string | null;
  publisher?: string | null;
  finding?: string;
  url?: string;
}

export interface SEOMeta {
  titleTag: string;
  h1: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  readTime: string;
  secondaryKeywords?: string[];
}

export interface Editorial {
  updatedAt?: string;
  reviewedBy?: string;
  /** When set, the article is held back: not listed, linked, prerendered or put in the sitemap. The value says why. */
  hold?: string;
}

export interface Article {
  id: string;
  slug: string;
  domain: string;
  pillarType: string;
  status?: string;
  seo: SEOMeta;
  editorial?: Editorial;
  content?: {
    answer?: string;
    sections?: Section[];
  };
  faqs?: FAQ[];
  citations?: Citation[];
  schema?: {
    article?: {
      datePublished?: string;
      dateModified?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}
