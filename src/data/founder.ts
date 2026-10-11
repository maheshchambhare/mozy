/**
 * Mahesh's footer sticker: an SVG traced from his own photo (public/assets/founder/mahesh.svg). The overlay drawn on
 * top of it uses the same viewBox: an eyelid for the open eye (so the footer can blink it) and the two doodle bursts
 * that pop around his head, one stroke per tick.
 */
export type FounderLid = { d: string; fill: string; lash: string; lashWidth: number; origin: { x: number; y: number } };

export const founderSticker: {
  src: string; width: number; height: number; viewBox: string;
  lid: FounderLid | null;
  marks: { width: number; ticks: string[] }[];
} = {
  src: '/assets/founder/mahesh.svg',
  width: 840,
  height: 904,
  viewBox: '0 0 840 904',
  lid: {
    d: 'M241.9 508.1C243 505.9 246.1 498.5 248.5 494.7C250.9 490.9 252.9 488.7 256.3 485.1C259.6 481.6 263.9 476.9 268.6 473.6C273.2 470.2 278.5 466.8 284 465C289.5 463.3 295.9 463 301.7 462.9C307.4 462.7 313 463.3 318.5 464C324.1 464.7 330.1 465.9 334.9 467C339.8 468.1 343.4 468.2 347.4 470.5C351.4 472.8 357.1 478.9 359 480.6C356.6 481.5 349.4 484.2 344.6 486C339.8 487.8 335.1 489.8 330.3 491.6C325.4 493.3 320.6 495 315.7 496.3C310.8 497.6 305.9 498.9 300.9 499.6C295.9 500.4 290.9 500.8 285.8 501C280.7 501.1 275.5 500.8 270.3 500.6C265.1 500.5 259.5 499 254.8 500.2C250.1 501.4 244 506.8 241.9 508.1Z',
    fill: '#EBA885',
    lash: 'M241.9 508.1C244 506.8 250.1 501.4 254.8 500.2C259.5 499 265.1 500.5 270.3 500.6C275.5 500.8 280.7 501.1 285.8 501C290.9 500.8 295.9 500.4 300.9 499.6C305.9 498.9 310.8 497.6 315.7 496.3C320.6 495 325.4 493.3 330.3 491.6C335.1 489.8 339.8 487.8 344.6 486C349.4 484.2 356.6 481.5 359 480.6',
    lashWidth: 7.0,
    origin: { x: 300.5, y: 462.9 },
  },
  marks: [
    { width: 20.8, ticks: ['M667 114.8L692.8 27.7', 'M707.3 154.1L767.5 84.7', 'M738.7 206L812.7 180.2'] },
    { width: 17.6, ticks: ['M135.9 710.5L72.2 733.8', 'M164.8 751.3L118.6 807.5', 'M204.6 780.3L186.4 849.5'] },
  ],
};
