import { useRef, useState } from 'react';
import { articles } from '../data/articles';
import { ArticleCard } from '../components/ArticleCard';
import { useJournalMotion } from '../hooks/useJournalMotion';
import '../journal.css';
export default function BlogIndex() {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('All');
  const root = useRef<HTMLElement>(null);
  const topics = ['All', 'Dopamine', 'Screen time', 'Habits', 'Sleep', 'Walking'];
  const filtered = articles.filter(article => {
    const haystack = `${article.seo.h1} ${article.seo.metaDescription} ${(article.seo.secondaryKeywords ?? []).join(' ')}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase()) && (topic === 'All' || (topic === 'Walking' ? /walk|step|pedometer/.test(haystack) : haystack.includes(topic.toLowerCase())));
  });
  useJournalMotion(root, `${topic}:${search}`);
  return <main className="journal lp-wrap" ref={root} id="main"><header className="journal-heading"><span className="lp-eyebrow">THE MOZY JOURNAL</span><h1>A little perspective.<br /><span>A little more life.</span></h1><p>Explore ideas about screen time, everyday movement, and building a more intentional relationship with your phone.</p><div className="journal-count">{articles.length} stories to explore <span aria-hidden="true">↘</span></div></header><section className="journal-tools" aria-label="Find an article"><label htmlFor="journal-search">Find your next read</label><div className="journal-search-wrap"><span aria-hidden="true">⌕</span><input id="journal-search" type="search" placeholder="Try screen time, sleep, or walking…" value={search} onChange={event => setSearch(event.target.value)} /></div><div className="journal-filters">{topics.map(item => <button key={item} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}</div></section><div className="journal-results" role="status">{filtered.length} {filtered.length === 1 ? 'story' : 'stories'}{topic !== 'All' ? ` about ${topic.toLowerCase()}` : ''}</div><div className="journal-grid">{filtered.map((article, index) => <ArticleCard key={article.id} article={article} index={index} />)}</div>{!filtered.length && <div className="journal-empty"><h2>No stories found just yet.</h2><p>Try another topic or a shorter search.</p><button className="lp-button" onClick={() => { setSearch(''); setTopic('All'); }}>See all stories</button></div>}<aside className="journal-bottom"><div><span className="lp-eyebrow">TAKE THE NEXT STEP</span><h2>Read a little. Walk a little.</h2><p>Turn your next walk into time for the apps you love.</p></div><a className="lp-button" href="/#get">Meet MOZY ↗</a></aside></main>;
}
