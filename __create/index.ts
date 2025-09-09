import path from 'path';
import { Hono } from 'hono';
import { registerRoutes } from './route-builder';

const app = new Hono();

// adjust this if your dev server mounts the app at a different base
const mountPrefix = '/api';

// Log every incoming request to help debug routing.
app.use('*', async (c, next) => {
  try {
    const url = new URL(c.req.url);
    console.log(`[__create] incoming ${c.req.method} ${url.pathname}`);
  } catch (e) {
    console.log('[__create] incoming request (failed to parse URL)');
  }
  return await next();
});

/* adapter: wrap a Next-style handler (req: Request) into a Hono handler (c) */
function adaptMethodHandler(fn: (req: Request) => unknown) {
  return async (c: any) => {
    try {
      const req: Request = c.req;
      const result = await fn(req);
      if (result instanceof Response) return result;
      if (result !== undefined) return c.json(result);
      return new Response(null, { status: 204 });
    } catch (err: any) {
      console.error('[__create] handler error:', err && (err.stack || err.message) || err);
      return new Response('Internal Server Error', { status: 500 });
    }
  };
}

function registerWithHono(appInstance: any, routePath: string, mod: any) {
  if (!mod) {
    console.warn(`[__create] module for ${routePath} is undefined — skipping`);
    return;
  }

  // Build list of paths to register so both prefixed and unprefixed requests match.
  const paths = [routePath];
  if (!routePath.startsWith(mountPrefix)) {
    const prefixed = mountPrefix + routePath;
    paths.push(prefixed);
  }

  // Try mounting default export (router) on both paths.
  if (typeof mod.default === 'function') {
    for (const p of paths) {
      try {
        appInstance.route(p, mod.default);
        console.log(`[__create] mounted default handler for ${p}`);
      } catch (e) {
        console.warn(`[__create] failed to mount default handler for ${p}:`, e);
      }
    }
    return;
  }

  const mapping: Array<[string, string]> = [
    ['GET', 'get'],
    ['POST', 'post'],
    ['PUT', 'put'],
    ['DELETE', 'delete'],
    ['OPTIONS', 'options'],
    ['PATCH', 'patch'],
  ];

  let registeredAny = false;
  for (const [exportName, methodName] of mapping) {
    if (typeof mod[exportName] === 'function') {
      for (const p of paths) {
        if (typeof appInstance[methodName] === 'function') {
          try {
            appInstance[methodName](p, adaptMethodHandler(mod[exportName]));
            console.log(`[__create] registered ${exportName} for ${p}`);
            registeredAny = true;
          } catch (e) {
            console.warn(`[__create] failed to register ${exportName} for ${p}:`, e);
          }
        }
      }
    }
  }

  if (typeof mod.handler === 'function') {
    for (const p of paths) {
      try {
        if (typeof appInstance.all === 'function') {
          appInstance.all(p, adaptMethodHandler(mod.handler));
          console.log(`[__create] registered handler (all) for ${p}`);
        } else {
          if (typeof appInstance.get === 'function') appInstance.get(p, adaptMethodHandler(mod.handler));
          if (typeof appInstance.post === 'function') appInstance.post(p, adaptMethodHandler(mod.handler));
          console.log(`[__create] registered handler fallback (GET/POST) for ${p}`);
        }
        registeredAny = true;
      } catch (e) {
        console.warn(`[__create] failed to register handler for ${p}:`, e);
      }
    }
  }

  if (!registeredAny) {
    console.warn(`[__create] no HTTP handlers found for ${routePath} — skipping`);
  }
}

// Top-level await ensures registration finishes before the app is exported.
try {
  const routesRoot = path.join(process.cwd(), 'src', 'app', 'api');
  await registerRoutes(routesRoot, (routePath: string, mod: any) =>
    registerWithHono(app, routePath, mod)
  );
  console.log('[__create] route registration complete');
} catch (err) {
  console.error('[__create] fatal error during route registration:', err);
}

export default app;