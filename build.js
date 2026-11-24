import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { bikes } from './src/bikes.js';

const output = new URL('./dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('bikes/', output), { recursive: true });

const pages = [
  ['index.html', 'Bike rentals'],
  ['bikes.html', 'Bike List'],
  ['rented.html', 'Rented Bikes'],
  ['404.html', 'Page unavailable'],
  ...bikes.map(bike => ['bikes/' + bike.id + '.html', bike.name])
];

await Promise.all([
  ...['app.js', 'bikes.js', 'style.css'].map(file => copyFile(new URL('./src/' + file, import.meta.url), new URL(file, output))),
  ...pages.map(([file, title]) => writeFile(new URL(file, output), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#122b23">
  <title>${title} | Spoke</title>
  <link rel="stylesheet" href="/style.css">
  <script type="module" src="/app.js"></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header></header>
  <main id="main" tabindex="-1"></main>
  <footer><div class="wrap">Spoke Bike Rentals <span>Practice demo</span></div></footer>
  <noscript>This bike rental demo requires JavaScript.</noscript>
</body>
</html>
`))
]);
console.log(`Built ${pages.length} HTML pages in dist/`);
