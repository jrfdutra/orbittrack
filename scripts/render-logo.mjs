import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('entrega/logo');

async function render(file, out, width) {
  await sharp(path.join(dir, file), { density: 300 })
    .resize({ width })
    .png()
    .toFile(path.join(dir, out));
  console.log('ok', out);
}

await render('orbittrack-icon.svg', 'orbittrack-icon-1024.png', 1024);
await render('orbittrack-icon.svg', 'orbittrack-icon-512.png', 512);
await render('orbittrack-icon.svg', 'orbittrack-icon-256.png', 256);
await render('orbittrack-icon.svg', 'favicon-64.png', 64);
await render('orbittrack-logo.svg', 'orbittrack-logo-2400.png', 2400);
await render('orbittrack-logo.svg', 'orbittrack-logo-1200.png', 1200);
await render('orbittrack-logo-dark.svg', 'orbittrack-logo-dark-2400.png', 2400);
await render('orbittrack-logo-dark.svg', 'orbittrack-logo-dark-1200.png', 1200);

const copyTargets = ['public/brand'];
for (const t of copyTargets) {
  fs.mkdirSync(t, { recursive: true });
  for (const f of fs.readdirSync(dir)) {
    fs.copyFileSync(path.join(dir, f), path.join(t, f));
  }
}
console.log('assets copiados para public/brand');
