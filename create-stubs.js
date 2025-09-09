// Run from your project root (E:\web):
//   node create-stubs.js

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const apiRoot = path.join(root, 'src', 'app', 'api');

if (!fs.existsSync(apiRoot)) {
  console.error('API root not found:', apiRoot);
  process.exit(1);
}

const stub = `export async function GET() {
  return Response.json({ ok: true, message: "dev stub GET", path: "/" }, { status: 200 });
}
export async function POST(request) {
  const payload = await request.json().catch(()=>null);
  console.log("[dev-stub] POST", payload);
  return Response.json({ ok: true, message: "dev stub POST", payload }, { status: 200 });
}
`;

function walkDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // create stub if no route.js/route.ts
      const rjs = path.join(full, 'route.js');
      const rts = path.join(full, 'route.ts');
      if (!fs.existsSync(rjs) && !fs.existsSync(rts)) {
        try {
          fs.writeFileSync(rjs, stub, { encoding: 'utf8' });
          console.log('Created stub:', rjs);
        } catch (err) {
          console.error('Failed to create', rjs, err);
        }
      } else {
        console.log('Exists:', full);
      }
      walkDirs(full);
    }
  }
}

walkDirs(apiRoot);