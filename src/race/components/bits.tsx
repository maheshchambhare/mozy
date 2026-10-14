import { countryByCode } from '../mock/places';
import { crownSvg, type CrownKind } from '../crowns';

// Flag SVGs for the race countries only (emoji flags don't render on Windows).
const flagFiles = import.meta.glob(
  '/node_modules/flag-icons/flags/4x3/{in,us,br,gb,de,fr,jp,mx,ca,au,id,ph,ng,ke,za,eg,tr,sa,ae,pk,bd,np,lk,vn,th,kr,my,ru,es,it,nl,se,no,fi,dk,pl,ua,gr,pt,ie,ch,at,ar,co,cl,pe,gh,ma,dz,et,tz,ug,nz,kz,mn}.svg',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;
const flagUrl = (cc: string) => flagFiles[`/node_modules/flag-icons/flags/4x3/${cc.toLowerCase()}.svg`];

export function Flag({ cc, className = '' }: { cc: string; className?: string }) {
  const url = flagUrl(cc);
  const name = countryByCode.get(cc)?.name ?? cc;
  if (!url) return <span className={`rc-flag is-text ${className}`}>{cc}</span>;
  return <img className={`rc-flag ${className}`} src={url} alt={name} title={name} width={20} height={15} loading="lazy" decoding="async" />;
}

const crownUrls = new Map<CrownKind, string>();
export function Crown({ kind, className = '' }: { kind: CrownKind; className?: string }) {
  let url = crownUrls.get(kind);
  if (!url) crownUrls.set(kind, (url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(crownSvg(kind))}`));
  return <img className={`rc-crown ${className}`} src={url} alt="" aria-hidden="true" width={24} height={18} />;
}
