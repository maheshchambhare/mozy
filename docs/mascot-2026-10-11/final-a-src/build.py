#!/usr/bin/env python3
"""Inline src/moz-kit.css + src/moz-kit.js into every src/*.src.html -> final-a/<name>.html (self-contained)."""
import pathlib

src = pathlib.Path(__file__).resolve().parent
out = src.parent
css = (src / 'moz-kit.css').read_text()
js = (src / 'moz-kit.js').read_text()
for f in sorted(src.glob('*.src.html')):
    html = f.read_text().replace('/*KIT_CSS*/', css).replace('/*KIT_JS*/', js)
    target = out / f.name.replace('.src.html', '.html')
    target.write_text(html)
    print('built', target.name, len(html))
