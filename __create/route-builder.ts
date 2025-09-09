import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export async function registerRoutes(
  routesRoot: string,
  register: (routePath: string, mod: any) => void
) {
  if (!fs.existsSync(routesRoot)) {
    console.warn('[route-builder] routes root not found:', routesRoot);
    return;
  }

  // Walk directories and collect candidate route files in deterministic order.
  const candidates: { chosen: string; routePath: string }[] = [];

  function walkDirs(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const subDir = path.join(dir, entry.name);

      const routeTs = path.join(subDir, 'route.ts');
      const routeJs = path.join(subDir, 'route.js');
      let chosen: string | null = null;
      if (fs.existsSync(routeTs)) chosen = routeTs;
      else if (fs.existsSync(routeJs)) chosen = routeJs;

      if (chosen) {
        const rel = path
          .relative(path.join(process.cwd(), 'src', 'app', 'api'), subDir)
          .replace(/\\+/g, '/');
        const routePath = '/' + (rel === '' ? '' : rel);
        candidates.push({ chosen, routePath });
      }

      walkDirs(subDir);
    }
  }

  walkDirs(routesRoot);

  // Import and register sequentially to avoid concurrent mutation of Hono's router.
  for (const item of candidates) {
    const { chosen, routePath } = item;
    try {
      const moduleUrl = pathToFileURL(chosen).href;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const mod = await import(/* @vite-ignore */ moduleUrl);

      if (!mod || Object.keys(mod).length === 0) {
        console.warn(
          `[route-builder] imported ${chosen} but module is empty/undefined — skipping registration`
        );
        continue;
      }

      const hasHandler =
        typeof mod.GET === 'function' ||
        typeof mod.POST === 'function' ||
        typeof mod.PUT === 'function' ||
        typeof mod.DELETE === 'function' ||
        typeof mod.default === 'function' ||
        typeof mod.handler === 'function';

      if (!hasHandler) {
        console.warn(
          `[route-builder] module ${chosen} does not export HTTP handlers (GET/POST/PUT/DELETE/default). Skipping.`
        );
        continue;
      }

      try {
        register(routePath, mod);
        console.log(`[route-builder] registered ${routePath} -> ${chosen}`);
      } catch (regErr) {
        console.warn(
          `[route-builder] module imported but register() failed for ${chosen}:`,
          regErr && (regErr.stack || regErr.message) || regErr
        );
      }
    } catch (e: any) {
      console.warn(
        `[route-builder] failed to import ${chosen}:`,
        e && (e.stack || e.message) || e
      );
    }
  }
}