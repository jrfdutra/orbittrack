// Gera os DOCX da documentação técnica e do manual de utilizador.
// Executar: node scripts/build-docs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { technicalDocument } from './lib/documentation.mjs';
import { manualDocument } from './lib/manual.mjs';
import { writeDocx } from './lib/docx-kit.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'entrega');
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  [technicalDocument, path.join(OUT, 'OrbitTrack_Documentacao_Tecnica.docx')],
  [manualDocument, path.join(OUT, 'OrbitTrack_Manual_de_Utilizador.docx')],
];

for (const [doc, file] of jobs) {
  const t0 = Date.now();
  const result = await writeDocx(doc, file);
  console.log(`${path.basename(file)}: ${(result.bytes / 1024).toFixed(0)} KB em ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

// Verificação mínima: ficheiro existe e tem assinatura ZIP (DOCX).
for (const [, file] of jobs) {
  const stat = fs.statSync(file);
  const head = fs.readFileSync(file).subarray(0, 2).toString('latin1');
  if (head !== 'PK') throw new Error(`Ficheiro inválido: ${file}`);
  console.log(`OK ${path.basename(file)} — ${stat.size} bytes`);
}
