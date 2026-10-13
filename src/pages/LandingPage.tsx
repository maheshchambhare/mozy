import { useEffect, useRef } from 'react';
import { landingSchema } from '../data/landing';
import '../landing.css';
import '../story.css';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import { FinalCta } from '../components/story/FinalCta';
import { Hero } from '../components/story/Hero';
import { HowChapter } from '../components/story/HowChapter';
import { QuestionsChapter } from '../components/story/QuestionsChapter';
import { StepHud } from '../components/story/StepHud';
import { WalkChapter } from '../components/story/WalkChapter';
import { WorldChapter } from '../components/story/WorldChapter';
import { useLandingMotion } from '../hooks/useLandingMotion';
import { useOffscreenRest } from '../hooks/useOffscreenRest';
import { observeSections } from '../lib/interactions';

/** One night-to-day story in six parts: each chapter shows a step of the Mozy loop instead of describing it. */
export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null);
  useLandingMotion(root);
  useOffscreenRest(root);
  // Analytics: one section_view per chapter as the visitor scrolls the story.
  useEffect(() => (root.current ? observeSections(root.current) : undefined), []);
  return (
    <div className="st" ref={root}>
      <script type="application/ld+json">{JSON.stringify(landingSchema).replaceAll('<', '\\u003c')}</script>
      <a className="st-skip" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <HowChapter />
        <WalkChapter />
        <WorldChapter />
        <QuestionsChapter />
        <FinalCta />
      </main>
      <SiteFooter />
      <StepHud />
    </div>
  );
}
