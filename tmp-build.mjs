import fs from 'node:fs';
import { technicalDocument } from './scripts/lib/documentation.mjs';
import { buildDocx } from './scripts/lib/docx-kit.mjs';
const buf = await buildDocx(technicalDocument);
fs.writeFileSync('C:/Users/devel/AppData/Local/Temp/opencode/test-tech.docx', buf);
console.log(buf.length);
