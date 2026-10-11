import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Stroke({ size = 18, strokeWidth = 2.4, children, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
}

export const ArrowUpRight = (props: IconProps) => <Stroke {...props}><path d="M7 17L17 7M9 7h8v8" /></Stroke>;
export const ArrowRight = (props: IconProps) => <Stroke {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Stroke>;
export const Moon = (props: IconProps) => <Stroke strokeWidth={2} {...props}><path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" /></Stroke>;
export const Lock = (props: IconProps) => <Stroke strokeWidth={3} {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Stroke>;
export const Check = (props: IconProps) => <Stroke strokeWidth={2.6} {...props}><path d="M5 12.5l4.5 4.5L19 7" /></Stroke>;
export const Minus = (props: IconProps) => <Stroke {...props}><path d="M6 12h12" /></Stroke>;
export const Plus = (props: IconProps) => <Stroke {...props}><path d="M12 5v14M5 12h14" /></Stroke>;
export const Menu = (props: IconProps) => <Stroke {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Stroke>;
export const Shield = (props: IconProps) => <Stroke strokeWidth={1.8} {...props}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></Stroke>;

export const Smartphone = (props: IconProps) => <Stroke strokeWidth={2} {...props}><rect x="6" y="2.5" width="12" height="19" rx="3" /><path d="M10.5 18h3" /></Stroke>;
export const UserOff = (props: IconProps) => <Stroke strokeWidth={2} {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5" /><path d="M3.5 3.5l17 17" /></Stroke>;
export const Chart = (props: IconProps) => <Stroke strokeWidth={2.2} {...props}><path d="M5 20v-7M12 20V5M19 20v-10" /></Stroke>;
export const Ban = (props: IconProps) => <Stroke strokeWidth={2} {...props}><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></Stroke>;
export const Globe = (props: IconProps) => <Stroke strokeWidth={1.9} {...props}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.5 3.6 5.4 3.6 8.5s-1.2 6-3.6 8.5c-2.4-2.5-3.6-5.4-3.6-8.5S9.6 6 12 3.5z" /></Stroke>;
export const Card = (props: IconProps) => <Stroke strokeWidth={2} {...props}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 10h18M7 15h4" /></Stroke>;
export const Mail = (props: IconProps) => <Stroke strokeWidth={2} {...props}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></Stroke>;
export const Info = (props: IconProps) => <Stroke strokeWidth={2} {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.6v.1" /></Stroke>;
export const Heart = (props: IconProps) => <Stroke strokeWidth={2} {...props}><path d="M12 20s-7.5-4.4-7.5-10.2A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.4C19.5 15.6 12 20 12 20z" /></Stroke>;
export const Clock = (props: IconProps) => <Stroke strokeWidth={2} {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Stroke>;
export const Toggle = (props: IconProps) => <Stroke strokeWidth={2} {...props}><rect x="2.5" y="7" width="19" height="10" rx="5" /><circle cx="16.5" cy="12" r="2.6" /></Stroke>;
export const User = (props: IconProps) => <Stroke strokeWidth={2} {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5" /></Stroke>;
export const XMark = (props: IconProps) => <Stroke strokeWidth={2.6} {...props}><path d="M7 7l10 10M17 7L7 17" /></Stroke>;
export const MapPinOff = (props: IconProps) => <Stroke strokeWidth={2} {...props}><path d="M9.2 4.3A6 6 0 0 1 18 9.5c0 1.6-.6 3.2-1.4 4.6M14.6 17.6C13.4 19.1 12 20.5 12 20.5S6 14.8 6 9.5c0-.8.1-1.5.4-2.2" /><path d="M3.5 3.5l17 17" /></Stroke>;

/** Two soles, used for the step counter and the walking trail. */
export function Footprints({ size = 22, color = 'currentColor', ...props }: SVGProps<SVGSVGElement> & { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}><ellipse cx="8.5" cy="7" rx="2.6" ry="4.2" fill={color} /><ellipse cx="15.5" cy="15.5" rx="2.6" ry="4.2" fill={color} /></svg>;
}
