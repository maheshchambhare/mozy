import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import { createElement as h } from 'react';
import { Router } from 'wouter';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
try {
  const template = await readFile('dist/index.html','utf8');
  const { default: LandingPage } = await server.ssrLoadModule('/src/pages/LandingPage.tsx');
  const { default: BlogIndex } = await server.ssrLoadModule('/src/pages/BlogIndex.tsx');
  const { default: BlogPost } = await server.ssrLoadModule('/src/pages/BlogPost.tsx');
  const { default: PrivacyPage } = await server.ssrLoadModule('/src/pages/PrivacyPage.tsx');
  const { default: PricingPage } = await server.ssrLoadModule('/src/pages/PricingPage.tsx');
  const { default: GetPage } = await server.ssrLoadModule('/src/pages/GetPage.tsx');
  const { default: NotFoundPage } = await server.ssrLoadModule('/src/pages/NotFoundPage.tsx');
  const { SiteHeader, SiteFooter } = await server.ssrLoadModule('/src/components/SiteChrome.tsx');
  const { pageMeta, siteUrl } = await server.ssrLoadModule('/src/data/metadata.ts');
  // Articles on editorial hold stay out of the build and the sitemap until the owner confirms them.
  const articles=JSON.parse(await readFile('src/data/mozy-articles.json','utf8')).filter(article=>!article.editorial?.hold);
  const routes=[
    {path:'/',component:LandingPage},
    {path:'/pricing',component:PricingPage},
    {path:'/blog',component:BlogIndex},
    {path:'/privacy',component:PrivacyPage},
    {path:'/get',component:GetPage,unlisted:true},
    ...articles.map(article=>({path:`/blog/${article.slug}`,component:BlogPost,props:{slug:article.slug},article})),
    // Hosts serve dist/404.html for unknown addresses. It is noindex, has no canonical URL or og:url, and stays out of the sitemap.
    {path:'/404',component:NotFoundPage,unlisted:true,file:'dist/404.html'}
  ];
  for (const route of routes) {
    const meta=pageMeta(route.path,route.article);
    let html=template.replace(/<title>.*?<\/title>/s,`<title>${escape(meta.title)}</title>`);
    html=meta.found?html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${escape(meta.url)}" />`):html.replace(/[ \t]*<link rel="canonical"[^>]*>\n?/,'').replace(/[ \t]*<meta property="og:url"[^>]*>\n?/,'');
    const tags={'name:description':meta.description,'name:robots':meta.robots,'property:og:title':meta.ogTitle,'property:og:description':meta.ogDescription,...(meta.found?{'property:og:url':meta.url}:{}),'property:og:image':meta.image,'property:og:type':meta.type,'name:twitter:title':meta.ogTitle,'name:twitter:description':meta.ogDescription,'name:twitter:image':meta.image};
    for(const [key,value] of Object.entries(tags)) {
      const [attribute,...parts]=key.split(':');const name=parts.join(':');const pattern=new RegExp(`<meta ${attribute}="${name}"[^>]*>`);
      const tag=`<meta ${attribute}="${name}" content="${escape(value)}" />`;
      html=pattern.test(html)?html.replace(pattern,tag):html.replace('</head>',`${tag}\n</head>`);
    }
    const content=route.path==='/'?h(route.component):h('div',{className:'lp'},h(SiteHeader),h(route.component,route.props),h(SiteFooter));
    html=html.replace('<div id="root"></div>',`<div id="root">${renderToString(h(Router, { ssrPath: route.path }, content))}</div>`);
    // Cloudflare serves dist/pricing.html at /pricing (the canonical, no trailing slash); a pricing/index.html would
    // instead be redirected to /pricing/.
    const file=route.file??(route.path==='/'?'dist/index.html':`dist${route.path}.html`);
    await mkdir(dirname(file),{recursive:true});await writeFile(file,html);
  }
  const sitemapEntries = routes.filter(route => !route.unlisted).map(route => {
    const lastmod = route.article?.editorial?.updatedAt || route.article?.schema?.article?.dateModified;
    const changefreq = route.path === '/' || route.path === '/pricing' ? 'daily' : 'weekly';
    const priority = route.path === '/' ? '1.0' : route.path === '/pricing' ? '0.9' : route.path.startsWith('/blog/') ? '0.8' : '0.7';
    return `  <url>\n    <loc>${siteUrl}${route.path}</loc>\n${lastmod ? `    <lastmod>${escape(lastmod)}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
  await writeFile('dist/sitemap.xml', sitemap);
  console.log(`Prerendered ${routes.length} pages (including 404.html) with unique metadata, /pricing, and full sitemap with lastmod.`);
} finally { await server.close(); }
