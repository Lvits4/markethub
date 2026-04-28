/**
 * Uso único con --move: aplana helpers/hooks/queries/requests/types a Module/Module.ts.
 * Sin --move: solo reescribe imports (idempotente salvo que vuelvas a tener .ts sueltos en esas carpetas).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src');
const MODULE_ROOTS = ['helpers', 'hooks', 'queries', 'requests', 'types'];

function walkDir(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkDir(p, acc);
    else if (/\.(tsx?)$/.test(name)) acc.push(p);
  }
  return acc;
}

function moveModules() {
  for (const root of MODULE_ROOTS) {
    const rootPath = path.join(SRC, root);
    const files = fs.readdirSync(rootPath).filter((f) => f.endsWith('.ts'));
    for (const f of files) {
      const base = f.replace(/\.ts$/, '');
      const srcFile = path.join(rootPath, f);
      const destDir = path.join(rootPath, base);
      const destFile = path.join(destDir, f);
      fs.mkdirSync(destDir, { recursive: true });
      fs.renameSync(srcFile, destFile);
    }
  }
}

/** Añade /nombre al final del path del módulo (helpers/foo -> helpers/foo/foo). */
function expandModulePath(importPath) {
  return importPath.replace(
    /^(.*\/)(helpers|hooks|queries|requests|types)\/([a-zA-Z0-9]+)$/,
    (_, prefix, dir, name) => `${prefix}${dir}/${name}/${name}`,
  );
}

function fixFileContent(filePath, content) {
  let c = content;
  const relFromSrc = path.relative(SRC, filePath);
  const parts = relFromSrc.split(path.sep);
  const inModuleSubfolder =
    parts.length >= 3 &&
    MODULE_ROOTS.includes(parts[0]) &&
    parts[1] !== '' &&
    parts[2]?.endsWith('.ts');

  // from '...' / from "..."
  c = c.replace(
    /from\s+(["'])((?:\.\.\/|\.\/)*)(helpers|hooks|queries|requests|types)\/([a-zA-Z0-9]+)\1/g,
    (_, q, prefix, dir, name) =>
      `from ${q}${expandModulePath(`${prefix}${dir}/${name}`)}${q}`,
  );

  if (!inModuleSubfolder) return c;

  const top = parts[0];

  // requests/*/*.ts: ./fetchDefault -> ../fetchDefault/fetchDefault
  if (top === 'requests') {
    c = c.replace(
      /from\s+(["'])\.\/fetchDefault\1/g,
      `from $1../fetchDefault/fetchDefault$1`,
    );
  }

  const subdirNames = (folder) =>
    new Set(
      fs.readdirSync(path.join(SRC, folder)).filter((n) => {
        const p = path.join(SRC, folder, n);
        return fs.statSync(p).isDirectory();
      }),
    );

  // types/*/*.ts: ./foo -> ../foo/foo
  if (top === 'types') {
    const names = subdirNames('types');
    c = c.replace(
      /from\s+(["'])\.\/([a-zA-Z0-9]+)\1/g,
      (m, q, name) => (names.has(name) ? `from ${q}../${name}/${name}${q}` : m),
    );
  }

  // helpers/*/*.ts: p. ej. ./storagePublicUrl -> ../storagePublicUrl/storagePublicUrl
  if (top === 'helpers') {
    const names = subdirNames('helpers');
    c = c.replace(
      /from\s+(["'])\.\/([a-zA-Z0-9]+)\1/g,
      (m, q, name) => (names.has(name) ? `from ${q}../${name}/${name}${q}` : m),
    );
  }

  // hooks/*/*.ts: p. ej. ./useAuth -> ../useAuth/useAuth
  if (top === 'hooks') {
    const names = subdirNames('hooks');
    c = c.replace(
      /from\s+(["'])\.\/([a-zA-Z0-9]+)\1/g,
      (m, q, name) => (names.has(name) ? `from ${q}../${name}/${name}${q}` : m),
    );
  }

  // Antes el archivo estaba en src/hooks/; ahora en src/hooks/foo/: un ../ extra hacia src.
  if (MODULE_ROOTS.includes(top)) {
    const singleUp =
      /from\s+(["'])\.\.\/(config|context|validations|helpers|hooks|queries|requests|types)\//g;
    c = c.replace(singleUp, `from $1../../$2/`);
  }

  return c;
}

function main() {
  const doMove = process.argv.includes('--move');
  if (doMove) {
    moveModules();
    console.log('Movidos módulos a subcarpetas.');
  }

  const allFiles = walkDir(SRC);
  for (const file of allFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    const next = fixFileContent(file, raw);
    if (next !== raw) fs.writeFileSync(file, next);
  }
  console.log('Importaciones actualizadas.');
}

main();
