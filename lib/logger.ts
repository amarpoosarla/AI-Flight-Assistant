// ============================================================
// Server-side logger — writes to logs/dev.log on disk.
// Claude can read this file directly to diagnose issues.
// No-ops in non-Node environments (e.g. edge runtime, browser).
// ============================================================

import type { WriteStream } from 'fs';

type Level = 'info' | 'warn' | 'error' | 'tool';

let _stream: WriteStream | null = null;

function getStream(): WriteStream | null {
  if (typeof process === 'undefined' || typeof window !== 'undefined') return null;

  if (!_stream) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs') as typeof import('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path') as typeof import('path');
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      _stream = fs.createWriteStream(path.join(logDir, 'dev.log'), { flags: 'a' });
    } catch {
      return null;
    }
  }
  return _stream;
}

function write(level: Level, ...args: unknown[]): void {
  const ts = new Date().toISOString();
  const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a, null, 0))).join(' ');
  const line = `[${ts}] [${level.toUpperCase().padEnd(5)}] ${msg}\n`;

  // Always mirror to console
  if (level === 'error') console.error(line.trimEnd());
  else console.warn(line.trimEnd());

  // Write to file
  getStream()?.write(line);
}

export const logger = {
  info: (...args: unknown[]) => write('info', ...args),
  warn: (...args: unknown[]) => write('warn', ...args),
  error: (...args: unknown[]) => write('error', ...args),
  tool: (name: string, args: unknown, result?: unknown) => {
    write('tool', `${name}`, 'args:', args, result !== undefined ? '→' : '', result ?? '');
  },
};
