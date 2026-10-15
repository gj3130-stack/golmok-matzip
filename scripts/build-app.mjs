// Builds the static app bundle (out/) for Capacitor.
// API routes and server-only code stay on Vercel; the app calls them over HTTPS.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const API_BASE = process.env.APP_API_BASE || 'https://golmok-matzip-app.vercel.app';

let code = 0;
try {
  fs.rmSync('out', { recursive: true, force: true });
  // Only public NEXT_PUBLIC_* values are inlined. Server keys (DATA_GO_KR_API_KEY, service role, etc.) are never referenced by client code.
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, BUILD_TARGET: 'app', NEXT_PUBLIC_API_BASE: API_BASE },
  });
  // Safety check: no server secret names/values in the bundle
  const env = Object.fromEntries(
    (fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '')
      .split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.split('=')[0], l.slice(l.indexOf('=') + 1).trim()])
  );
  const secrets = Object.entries(env).filter(([k, v]) => !k.startsWith('NEXT_PUBLIC_') && v.length > 8);
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p) : /\.(js|html|json|txt)$/.test(e.name) && files.push(p);
  });
  walk('out');
  const leaks = [];
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8');
    for (const [k, v] of secrets) if (t.includes(v)) leaks.push(`${k} in ${f}`);
  }
  if (leaks.length) { console.error('SECRET LEAK (names only):', leaks); code = 1; }
  else console.log(`OK: checked ${files.length} files, ${secrets.length} server secrets not present in app bundle.`);
} catch (e) {
  code = 1;
}
process.exit(code);
