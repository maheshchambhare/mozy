// Moz v1: the Mozy store mascot as an SVG. moz(mood, {id}) returns markup in a 300x320 viewBox.
(function () {
  const BODY = 'M150 64 C182 64 249 101 260 170 C269 236 224 272 150 272 C76 272 31 236 40 170 C51 101 118 64 150 64 Z';
  // A plump leaf in local coordinates: base at 0,0, tip pointing along +x.
  const LEAF = 'M0 0 C3 -24 26 -42 54 -42 C81 -42 98 -25 98 -4 C98 17 79 31 52 31 C25 31 3 19 0 0 Z';
  function leaf(u, x, y, angle, scale, flip) {
    const t = `translate(${x} ${y}) rotate(${angle}) scale(${scale} ${flip ? -scale : scale})`;
    return `<g transform="${t}">
      <path d="${LEAF}" fill="url(#${u}leaf)"/>
      <g clip-path="url(#${u}leafclip)">
        <path d="${LEAF}" fill="none" stroke="#2a7020" stroke-width="9" opacity="0.32" filter="url(#${u}b3)"/>
        <path d="M-10 24 C26 44 84 40 112 12 L112 60 L-10 60 Z" fill="#2c741f" opacity="0.5" filter="url(#${u}b6)"/>
        <ellipse cx="50" cy="-23" rx="32" ry="12" fill="#bdeb8c" opacity="0.7" filter="url(#${u}b6)"/>
        <path d="M8 -2 C32 -7 62 -8 88 -5" stroke="#3a8a29" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.42" filter="url(#${u}b1)"/>
      </g>
    </g>`;
  }
  function eye(u, cx, cy, mood) {
    if (mood === 'cheer' || mood === 'joy') {
      return `<path d="M${cx - 15} ${cy + 4} Q${cx} ${cy - 13} ${cx + 15} ${cy + 4}" stroke="#2a150d" stroke-width="6" stroke-linecap="round" fill="none"/>`;
    }
    return `<g>
      <ellipse cx="${cx}" cy="${cy}" rx="21" ry="23.5" fill="url(#${u}eye)"/>
      <ellipse cx="${cx}" cy="${cy + 13}" rx="12" ry="6.5" fill="#7a4322" opacity="0.55" filter="url(#${u}b2)"/>
      <circle cx="${cx + 6.5}" cy="${cy - 9}" r="7.8" fill="#fff"/>
      <circle cx="${cx - 8}" cy="${cy + 8}" r="3" fill="#fff" opacity="0.9"/>
    </g>`;
  }
  function mouth(u, mood) {
    if (mood === 'stern') return `<path d="M138 200 Q150 192 162 200" stroke="#3a1a12" stroke-width="4.6" stroke-linecap="round" fill="none"/>`;
    const big = mood === 'cheer';
    const d = big ? 'M130 186 Q150 191 170 186 C170 205 161 215 150 215 C139 215 130 205 130 186 Z'
                  : 'M133 187 Q150 191 167 187 C167 203 159 211 150 211 C141 211 133 203 133 187 Z';
    return `<clipPath id="${u}mclip"><path d="${d}"/></clipPath>
      <path d="${d}" fill="#4b1913"/>
      <ellipse cx="150" cy="${big ? 213 : 209}" rx="${big ? 14 : 12}" ry="${big ? 9 : 8}" fill="#f2545f" clip-path="url(#${u}mclip)"/>`;
  }
  // Arms: small round nubs that sit on the body sides; raised ones are short mitten paws.
  function nub(u, side) {
    const x = side < 0 ? 40 : 260, y = 224, a = side * -30;
    return `<g class="moz-arm moz-arm-${side < 0 ? 'l' : 'r'}">
      
      <ellipse cx="${x}" cy="${y}" rx="12" ry="15.5" transform="rotate(${a} ${x} ${y})" fill="url(#${u}nub)"/>
      <ellipse cx="${x + side * 2}" cy="${y - 5}" rx="4.5" ry="3.5" fill="#fff" opacity="0.75"/></g>`;
  }
  function paw(u, side, angle, pad) {
    // A raised paw drawn behind the body, so it grows out of the side: a plump bean ending in a round mitten.
    const sx = side < 0 ? 66 : 234;
    return `<g class="moz-arm moz-arm-${side < 0 ? 'l' : 'r'} is-raised" style="transform-origin:${sx}px 182px"><g transform="translate(${sx} 182) rotate(${side * angle})">
      <path d="M-18 -2 C-21 -16 -23 -30 -22 -44 C-20 -61 -11 -69 0 -69 C11 -69 20 -61 22 -44 C23 -30 21 -16 18 -2 Z" fill="url(#${u}pawg)"/>
      <path d="M-18 -2 C-21 -16 -23 -30 -22 -44 C-20 -61 -11 -69 0 -69 C11 -69 20 -61 22 -44 C23 -30 21 -16 18 -2 Z" fill="none" stroke="#bf9f8a" stroke-width="9" opacity="0.45" filter="url(#${u}b3)" clip-path="url(#${u}pawclip)"/>
      
      <ellipse cx="${-side * 6}" cy="-58" rx="9" ry="7" fill="#fff" opacity="0.8" filter="url(#${u}b2)"/>
      ${pad ? `<ellipse cx="${side * 1}" cy="-46" rx="10" ry="11.5" fill="#f4aaa9" opacity="0.65" filter="url(#${u}b1)"/>
      <g fill="#f4aaa9" opacity="0.6"><circle cx="-8" cy="-60" r="3.2"/><circle cx="0" cy="-62.5" r="3.2"/><circle cx="8" cy="-60" r="3.2"/></g>` : ''}
    </g></g>`;
  }
  function moz(mood = 'happy', opts = {}) {
    const u = (opts.id || 'mz') + '-';
    const stern = mood === 'stern';
    const cheer = mood === 'cheer';
    const wave = mood === 'wave';
    const brows = stern ? `<g stroke="#3a1a12" stroke-width="5" stroke-linecap="round"><path d="M88 138 L118 148"/><path d="M182 148 L212 138"/></g>` : '';
    const back = [
      stern || cheer ? paw(u, -1, cheer ? 44 : 36, stern) : '',
      cheer || wave ? paw(u, 1, cheer ? 44 : 38, false) : '',
    ].join('');
    const front = '';
    const sides = [stern || cheer ? '' : nub(u, -1), cheer || wave ? '' : nub(u, 1)].join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -40 300 340" class="moz is-${mood}">
  <defs>
    <filter id="${u}b1" filterUnits="userSpaceOnUse" x="-60" y="-60" width="420" height="440"><feGaussianBlur stdDeviation="1"/></filter>
    <filter id="${u}b2" filterUnits="userSpaceOnUse" x="-60" y="-60" width="420" height="440"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="${u}b3" filterUnits="userSpaceOnUse" x="-60" y="-60" width="420" height="440"><feGaussianBlur stdDeviation="3.5"/></filter>
    <filter id="${u}b6" filterUnits="userSpaceOnUse" x="-120" y="-120" width="540" height="560"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="${u}b14" filterUnits="userSpaceOnUse" x="-60" y="-60" width="420" height="440"><feGaussianBlur stdDeviation="14"/></filter>
    <radialGradient id="${u}body" gradientUnits="userSpaceOnUse" cx="122" cy="122" r="185">
      <stop offset="0" stop-color="#fffdfa"/><stop offset="0.45" stop-color="#fbf5ef"/><stop offset="0.78" stop-color="#f1e4db"/><stop offset="1" stop-color="#e2cdc0"/>
    </radialGradient>
    <radialGradient id="${u}nub" cx="0.38" cy="0.32" r="0.8">
      <stop offset="0" stop-color="#fffdf9"/><stop offset="0.65" stop-color="#f3e9dd"/><stop offset="1" stop-color="#ddcbb8"/>
    </radialGradient>
    <radialGradient id="${u}pawg" cx="0.42" cy="0.18" r="0.95">
      <stop offset="0" stop-color="#fffdfa"/><stop offset="0.45" stop-color="#f6ede4"/><stop offset="1" stop-color="#d6bba8"/>
    </radialGradient>
    <linearGradient id="${u}foot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cdb9a5"/><stop offset="0.5" stop-color="#efe5d9"/><stop offset="1" stop-color="#fbf7f1"/>
    </linearGradient>
    <linearGradient id="${u}leaf" x1="0" y1="-38" x2="0" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#80cf55"/><stop offset="0.5" stop-color="#4fae37"/><stop offset="1" stop-color="#358b27"/>
    </linearGradient>
    <linearGradient id="${u}stem" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3f8f2d"/><stop offset="0.45" stop-color="#74c24f"/><stop offset="1" stop-color="#3a8429"/>
    </linearGradient>
    <radialGradient id="${u}eye" cx="0.5" cy="0.38" r="0.62">
      <stop offset="0" stop-color="#1c0e08"/><stop offset="0.7" stop-color="#1f100a"/><stop offset="1" stop-color="#4a2716"/>
    </radialGradient>
    <clipPath id="${u}clip"><path d="${BODY}"/></clipPath>
    <clipPath id="${u}leafclip"><path d="${LEAF}"/></clipPath>
    <clipPath id="${u}pawclip"><path d="M-18 -2 C-21 -16 -23 -30 -22 -44 C-20 -61 -11 -69 0 -69 C11 -69 20 -61 22 -44 C23 -30 21 -16 18 -2 Z"/></clipPath>
  </defs>
  <ellipse class="moz-shadow" cx="150" cy="290" rx="92" ry="11" fill="#5a4330" opacity="0.28" filter="url(#${u}b3)"/>
  <g class="moz-leg moz-leg-l"><ellipse cx="114" cy="272" rx="25" ry="15" fill="url(#${u}foot)"/></g>
  <g class="moz-leg moz-leg-r"><ellipse cx="186" cy="272" rx="25" ry="15" fill="url(#${u}foot)"/></g>
  <g class="moz-bob">
    ${sides}
    <path class="moz-stem" d="M137 84 C138 66 140 54 143 46 C146 42 156 42 159 46 C162 54 164 66 165 84 Z" fill="url(#${u}stem)"/>
    ${back}
    <path d="${BODY}" fill="url(#${u}body)"/>
    <g clip-path="url(#${u}clip)">
      <ellipse cx="172" cy="282" rx="150" ry="58" fill="#dbbca9" opacity="0.5" filter="url(#${u}b14)"/>
      <ellipse cx="268" cy="196" rx="34" ry="90" fill="#dcc3b4" opacity="0.45" filter="url(#${u}b14)"/>
      <ellipse cx="150" cy="276" rx="96" ry="12" fill="#fff8ef" opacity="0.55" filter="url(#${u}b6)"/>
      <ellipse cx="118" cy="118" rx="52" ry="34" fill="#fff" opacity="0.8" filter="url(#${u}b14)"/>
      <ellipse cx="151" cy="72" rx="24" ry="7" fill="#c3a993" opacity="0.4" filter="url(#${u}b3)"/>
      <ellipse cx="36" cy="224" rx="10" ry="18" fill="#c9ab96" opacity="0.45" filter="url(#${u}b3)"/>
      <ellipse cx="264" cy="224" rx="10" ry="18" fill="#c9ab96" opacity="0.45" filter="url(#${u}b3)"/>
    </g>
    <g class="moz-sprout">
            ${leaf(u, 147, 48, -142, 1.0, true)}
      ${leaf(u, 155, 49, -14, 0.9, false)}
      <path d="M143 47 C146 41 156 41 159 47 C157 53 145 53 143 47 Z" fill="#4c9f34"/>
    </g>
    <ellipse cx="82" cy="198" rx="21" ry="13" fill="#ff8d9c" opacity="0.6" filter="url(#${u}b3)"/>
    <ellipse cx="218" cy="198" rx="21" ry="13" fill="#ff8d9c" opacity="0.6" filter="url(#${u}b3)"/>
    <g class="moz-eyes">${eye(u, 106, 170, mood)}${eye(u, 194, 170, mood)}</g>
    ${brows}
    ${mouth(u, mood)}
    ${front}
  </g>
</svg>`;
  }
  window.moz = moz;
})();
