// Turns the single-file artifact build into page content for a Claude artifact:
// the host supplies <html>, <head> and <body>, and reads the <title> from the
// first 8 KB, so the title leads and the document wrappers are removed.
import { readFileSync, writeFileSync, readFileSync as read } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'dist-artifact');
const html = readFileSync(join(dir, 'artifact.html'), 'utf8');

const title = html.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '<title>Upside</title>';
const styles = html.match(/<style[\s\S]*?<\/style>/g) ?? [];
const scripts = html.match(/<script[\s\S]*?<\/script>/g) ?? [];
const favicon = read(join(import.meta.dirname, '..', 'public', 'favicon.svg'), 'utf8').trim();

const page = [
  title,
  `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}">`,
  ...styles,
  '<div id="root"></div>',
  ...scripts,
].join('\n');

writeFileSync(join(dir, 'upside.html'), page);
console.log(`artifact page: ${(page.length / 1024).toFixed(0)} KB -> dist-artifact/upside.html`);
