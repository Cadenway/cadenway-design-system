import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const localCli = path.join(root, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
// Prefer the project CLI; use a globally installed CLI only while it is unavailable.
const command = existsSync(localCli) ? process.execPath : (process.platform === 'win32' ? 'ng.cmd' : 'ng');
const args = existsSync(localCli) ? [localCli, 'mcp', '--read-only'] : ['mcp', '--read-only'];
const child = spawn(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' && !existsSync(localCli) });
child.on('error', error => { process.stderr.write('Angular MCP could not start: ' + error.message + '\n'); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { if (!child.killed) child.kill(signal); });
