/**
 * Who makes Mozy, in one place. The company is mcrudra.com; "mcrudrax" is only the social-media handle
 * (Instagram, YouTube, Threads), so it appears in profile URLs and never as the company's name.
 */
const siteUrl = 'https://mozy.mcrudra.com';

export const COMPANY = {
  name: 'mcrudra.com',
  url: 'https://mcrudra.com',
  email: 'hello@mcrudra.com',
  promise: 'Use tech without letting it use you.',
  id: 'https://mcrudra.com/#organization',
  /** Brand accounts run under the @mcrudrax handle. */
  social: [
    ['Instagram', '@mcrudrax', 'https://www.instagram.com/mcrudrax/'],
    ['YouTube', '@mcrudrax', 'https://www.youtube.com/@mcrudrax'],
    ['Threads', '@mcrudrax', 'https://www.threads.com/@mcrudrax'],
    ['Facebook', 'Mahesh | Better Digital Life', 'https://www.facebook.com/share/1eR1g5xtip/'],
  ],
} as const;

export const FOUNDER = {
  name: 'Mahesh Chambhare',
  role: 'Indie developer and founder of mcrudra.com',
  id: 'https://mcrudra.com/#mahesh-chambhare',
  photo: '/assets/maker/mahesh-chambhare-384.webp',
  photoLarge: `${siteUrl}/assets/maker/mahesh-chambhare-640.jpg`,
  /** Personal founder accounts. */
  social: [
    ['X', '@resilientmahesh', 'https://x.com/resilientmahesh'],
    ['LinkedIn', 'Mahesh Chambhare', 'https://www.linkedin.com/in/maheshchambhare/'],
  ],
} as const;

/** schema.org Organization for mcrudra.com, with its founder. */
export const organizationSchema = {
  '@type': 'Organization',
  '@id': COMPANY.id,
  name: COMPANY.name,
  alternateName: ['mcrudra', 'MCRUDRA'],
  url: COMPANY.url,
  email: COMPANY.email,
  slogan: COMPANY.promise,
  founder: { '@id': FOUNDER.id },
  sameAs: COMPANY.social.map(([, , href]) => href),
};

/** schema.org Person for the founder, linked to the company and to the app he makes. */
export const founderSchema = {
  '@type': 'Person',
  '@id': FOUNDER.id,
  name: FOUNDER.name,
  jobTitle: 'Founder and indie developer',
  description: `${FOUNDER.name} is an indie developer and the founder of mcrudra.com, the studio that makes Mozy, an app that turns walking into screen time.`,
  image: FOUNDER.photoLarge,
  url: `${siteUrl}/#maker`,
  email: COMPANY.email,
  worksFor: { '@id': COMPANY.id },
  knowsAbout: ['Digital wellbeing', 'Screen time', 'Mobile app development'],
  sameAs: [...FOUNDER.social.map(([, , href]) => href), ...COMPANY.social.map(([, , href]) => href)],
};
