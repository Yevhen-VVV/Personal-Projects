/*
 * Bundles the built app into one self-contained HTML file.
 *
 *   npm run build && npm run bundle
 *
 * Used for hosting the app somewhere that serves a single page rather than a
 * directory: the CSS, the JavaScript and the icons are all inlined, so the
 * page has no second request to make.
 *
 * The file is written as page content only -- no doctype, html, head or body
 * wrapper -- because the host supplies that skeleton.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = process.argv[2] ?? 'dist/single.html';

const html = readFileSync('dist/index.html', 'utf8');

const cssHref = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)?.[1];
const jsSrc = html.match(/<script type="module"[^>]*src="([^"]+)"/)?.[1];
if (!cssHref || !jsSrc) throw new Error('Could not find the built CSS and JS in dist/index.html');

const css = readFileSync(`dist${cssHref}`, 'utf8');
const js = readFileSync(`dist${jsSrc}`, 'utf8');

const dataUri = (path, type) => `data:${type};base64,${readFileSync(path).toString('base64')}`;
const appleIcon = dataUri('dist/apple-touch-icon.png', 'image/png');

// A closing script tag inside the bundle would end the inline script early.
const safeJs = js.replace(/<\/script/gi, '<\\/script');

const page = `<title>Английский язык</title>
<style>
${css}
</style>

<div id="root"></div>

<script>
  // Tells the app there is no separate service worker file to register.
  window.__SINGLE_FILE__ = true;

  // iOS reads these from the live document when someone taps Add to Home
  // Screen, so injecting them here works even though the host owns <head>.
  (function () {
    var head = document.head || document.documentElement;
    function meta(name, content) {
      var el = document.createElement('meta');
      el.setAttribute('name', name);
      el.setAttribute('content', content);
      head.appendChild(el);
    }
    meta('apple-mobile-web-app-capable', 'yes');
    meta('apple-mobile-web-app-status-bar-style', 'default');
    meta('apple-mobile-web-app-title', 'Английский');
    meta('theme-color', '#12557f');
    meta('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=yes');

    var icon = document.createElement('link');
    icon.setAttribute('rel', 'apple-touch-icon');
    icon.setAttribute('href', ${JSON.stringify(appleIcon)});
    head.appendChild(icon);

    // The interface is Russian; the sentences under test carry their own
    // lang="en", so speech synthesis still switches voice for them.
    document.documentElement.setAttribute('lang', 'ru');
  })();
</script>

<script type="module">
${safeJs}
</script>
`;

writeFileSync(OUT, page);
const kb = (Buffer.byteLength(page) / 1024).toFixed(0);
console.log(`Wrote ${OUT} (${kb} KB, self-contained)`);
