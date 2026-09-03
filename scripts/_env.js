// Minimal .env.local loader (no dotenv dependency).
const fs = require('fs');
const path = require('path');

function loadEnv(file = '.env.local') {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) throw new Error(`Missing ${file}`);
  for (const rawLine of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

module.exports = { loadEnv };
