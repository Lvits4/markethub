/**
 * Migra rutas de uploads/ con carpetas UUID a carpetas con nombres legibles.
 * Uso: node scripts/migrate-storage-folders.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../uploads');

function slugifyForStorage(name) {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'sin-nombre';
}

function buildUploadFolder(kind, entityName, options = {}) {
  let segment = slugifyForStorage(entityName);
  const disambiguator = options.disambiguator;
  if (disambiguator != null && String(disambiguator).trim() !== '') {
    segment = `${segment}-${disambiguator}`;
  }
  const parent = options.parentName?.trim();
  if (parent) {
    const parentSlug = slugifyForStorage(parent);
    return `${kind}/${parentSlug}/${segment}`;
  }
  return `${kind}/${segment}`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function moveFile(oldRel, newRel) {
  const oldAbs = path.join(ROOT, oldRel);
  const newAbs = path.join(ROOT, newRel);
  if (!fs.existsSync(oldAbs)) {
    console.warn(`  [skip] no existe en disco: ${oldRel}`);
    return false;
  }
  if (oldRel === newRel) {
    console.log(`  [ok] ya en ruta destino: ${newRel}`);
    return true;
  }
  if (fs.existsSync(newAbs)) {
    console.warn(`  [skip] destino ya existe: ${newRel}`);
    return false;
  }
  ensureDir(path.dirname(newAbs));
  fs.renameSync(oldAbs, newAbs);
  console.log(`  ${oldRel} → ${newRel}`);
  return true;
}

function pruneEmptyDirs(startRel) {
  let current = path.dirname(startRel.replace(/\\/g, '/'));
  while (current && current !== '.') {
    const abs = path.join(ROOT, current);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) break;
    if (fs.readdirSync(abs).length > 0) break;
    fs.rmdirSync(abs);
    console.log(`  [rm dir] ${current}`);
    current = path.dirname(current);
  }
}

function newStorePath(storeName, oldPath) {
  const fileName = path.basename(oldPath.replace(/\\/g, '/'));
  return `${buildUploadFolder('stores', storeName)}/${fileName}`;
}

function newProductPath(storeName, productName, oldPath) {
  const fileName = path.basename(oldPath.replace(/\\/g, '/'));
  return `${buildUploadFolder('products', productName, { parentName: storeName })}/${fileName}`;
}

async function main() {
  const client = new pg.Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'markethub',
    password: process.env.DB_PASSWORD || 'markethub_secret',
    database: process.env.DB_NAME || 'markethub',
  });
  await client.connect();

  const moves = [];

  const stores = await client.query(
    'SELECT id, name, logo, banner FROM stores',
  );
  for (const store of stores.rows) {
    for (const field of ['logo', 'banner']) {
      const oldPath = store[field];
      if (!oldPath?.trim()) continue;
      const normalized = oldPath.trim().replace(/^\/+/, '');
      const newPath = newStorePath(store.name, normalized);
      if (normalized !== newPath) {
        moves.push({
          table: 'stores',
          id: store.id,
          column: field,
          oldPath: normalized,
          newPath,
        });
      }
    }
  }

  const products = await client.query(`
    SELECT pi.id, pi.url, p.name AS product_name, s.name AS store_name
    FROM product_images pi
    JOIN products p ON p.id = pi.product_id
    JOIN stores s ON s.id = p.store_id
  `);
  for (const row of products.rows) {
    const oldPath = row.url?.trim().replace(/^\/+/, '');
    if (!oldPath) continue;
    const newPath = newProductPath(row.store_name, row.product_name, oldPath);
    if (oldPath !== newPath) {
      moves.push({
        table: 'product_images',
        id: row.id,
        column: 'url',
        oldPath,
        newPath,
      });
    }
  }

  const users = await client.query(
    'SELECT id, first_name, last_name, email, avatar FROM users WHERE avatar IS NOT NULL',
  );
  for (const user of users.rows) {
    const oldPath = user.avatar?.trim().replace(/^\/+/, '');
    if (!oldPath) continue;
    const displayName =
      `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ||
      user.email?.split('@')[0] ||
      'usuario';
    const fileName = path.basename(oldPath);
    const newPath = `${buildUploadFolder('general', displayName)}/${fileName}`;
    if (oldPath !== newPath) {
      moves.push({
        table: 'users',
        id: user.id,
        column: 'avatar',
        oldPath,
        newPath,
      });
    }
  }

  const categories = await client.query(
    'SELECT id, name, image FROM categories WHERE image IS NOT NULL',
  );
  for (const cat of categories.rows) {
    const oldPath = cat.image?.trim().replace(/^\/+/, '');
    if (!oldPath) continue;
    const fileName = path.basename(oldPath);
    const newPath = `${buildUploadFolder('categories', cat.name)}/${fileName}`;
    if (oldPath !== newPath) {
      moves.push({
        table: 'categories',
        id: cat.id,
        column: 'image',
        oldPath,
        newPath,
      });
    }
  }

  console.log(`\nMigrando ${moves.length} archivo(s)...\n`);

  let moved = 0;
  for (const m of moves) {
    console.log(`[${m.table}.${m.column}] ${m.id}`);
    if (moveFile(m.oldPath, m.newPath)) {
      if (m.table === 'stores') {
        await client.query(
          `UPDATE stores SET ${m.column} = $1 WHERE id = $2`,
          [m.newPath, m.id],
        );
      } else if (m.table === 'product_images') {
        await client.query('UPDATE product_images SET url = $1 WHERE id = $2', [
          m.newPath,
          m.id,
        ]);
      } else if (m.table === 'users') {
        await client.query('UPDATE users SET avatar = $1 WHERE id = $2', [
          m.newPath,
          m.id,
        ]);
      } else if (m.table === 'categories') {
        await client.query('UPDATE categories SET image = $1 WHERE id = $2', [
          m.newPath,
          m.id,
        ]);
      }
      moved++;
      pruneEmptyDirs(m.oldPath);
    }
  }

  // Limpiar carpetas UUID huérfanas bajo stores/ y products/
  for (const kind of ['stores', 'products']) {
    const kindDir = path.join(ROOT, kind);
    if (!fs.existsSync(kindDir)) continue;
    for (const entry of fs.readdirSync(kindDir, { withFileTypes: true })) {
      const name = entry.name;
      const isLegacy =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpeg$/i.test(
          name,
        );
      if (!isLegacy) continue;
      const rel = `${kind}/${name}`;
      const abs = path.join(ROOT, rel);
      if (entry.isDirectory()) {
        if (fs.readdirSync(abs).length === 0) {
          fs.rmdirSync(abs);
          console.log(`[cleanup] carpeta vacía eliminada: ${rel}`);
        }
      } else if (entry.isFile()) {
        console.warn(
          `[cleanup] archivo huérfano en raíz de ${kind}/ (no referenciado en BD): ${rel}`,
        );
      }
    }
  }

  await client.end();
  console.log(`\nListo: ${moved}/${moves.length} archivo(s) migrado(s).\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
