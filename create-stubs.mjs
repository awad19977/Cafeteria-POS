import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const root = process.cwd();
const apiRoot = path.join(root, 'src', 'app', 'api');

const stub = `export async function GET() {
  return Response.json({ ok: true, message: "dev stub GET" }, { status: 200 });
}
export async function POST(request) {
  const payload = await request.json().catch(()=>null);
  console.log("[dev-stub] POST", payload);
  return Response.json({ ok: true, message: "dev stub POST", payload }, { status: 200 });
}
`;

async function walkDirs(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    console.error('Error reading directory', dir, err.message);
    return;
  }

  for (const e of entries) {
    if (e.isDirectory()) {
      const full = path.join(dir, e.name);
      const rjs = path.join(full, 'route.js');
      const rts = path.join(full, 'route.ts');

      if (!existsSync(rjs) && !existsSync(rts)) {
        try {
          await fs.writeFile(rjs, stub, { encoding: 'utf8' });
          console.log('Created stub:', rjs);
        } catch (err) {
          console.error('Failed to create', rjs, err);
        }
      } else {
        console.log('Exists:', full);
      }

      // recurse
      await walkDirs(full);
    }
  }
}

(async () => {
  if (!existsSync(apiRoot)) {
    console.error('API root not found:', apiRoot);
    process.exit(1);
  }

  console.log('Scanning', apiRoot);
  await walkDirs(apiRoot);
  console.log('Done.');
})();