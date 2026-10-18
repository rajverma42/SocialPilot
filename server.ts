import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect if tsx is already active
const isTsxActive = Boolean(
  process.env.TSX_ACTIVE === 'true' ||
  process.execArgv.some(arg => arg.includes('tsx'))
);

if (!isTsxActive) {
  // Started with standard `node server.ts` (production container or CLI)
  // Transparently launch with tsx ESM loader to resolve all TypeScript modules without linking errors
  const child = spawn(
    process.execPath,
    ['--import', 'tsx', path.resolve(__dirname, 'server/index.ts')],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        TSX_ACTIVE: 'true'
      }
    }
  );

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    }
    process.exit(code ?? 0);
  });
} else {
  // Already in a tsx execution context (e.g. `tsx server.ts`)
  await import('./server/index.ts');
}
