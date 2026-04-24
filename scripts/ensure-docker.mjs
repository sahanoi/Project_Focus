/**
 * Ensures the Docker engine is reachable (docker info).
 * On Windows, tries to start Docker Desktop from default install paths, then polls.
 * Env: DOCKER_WAIT_MS (default 180000)
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const maxMs = parseInt(process.env.DOCKER_WAIT_MS || '180000', 10);
const pollMs = 3000;

function dockerInfoOk() {
    const r = spawnSync('docker', ['info'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 20000,
        windowsHide: true,
    });
    return r.status === 0;
}

function tryLaunchDockerDesktopWindows() {
    const candidates = [
        path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Docker', 'Docker', 'Docker Desktop.exe'),
        path.join(
            process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
            'Docker',
            'Docker',
            'Docker Desktop.exe',
        ),
    ];
    for (const p of candidates) {
        if (p && fs.existsSync(p)) {
            const launched = spawnSync(p, [], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true,
            });
            if (launched.error) continue;
            console.log('Launched Docker Desktop; waiting for engine...');
            return true;
        }
    }
    return false;
}

async function main() {
    if (dockerInfoOk()) {
        return;
    }

    const start = Date.now();

    if (process.platform === 'win32') {
        tryLaunchDockerDesktopWindows();
        process.stdout.write('Waiting for Docker engine');
        while (Date.now() - start < maxMs) {
            if (dockerInfoOk()) {
                console.log('\nDocker engine is ready.');
                return;
            }
            process.stdout.write('.');
            await delay(pollMs);
        }
        console.error(`
Timed out after ${maxMs}ms waiting for Docker.

• Open Docker Desktop manually and wait until it says "Engine running"
• Or install Docker Desktop for Windows
• Or use your own Postgres: set SKIP_DOCKER=1 and a valid DATABASE_URL in .env
`);
        process.exit(1);
    }

    console.error(`
Docker engine is not reachable (docker info failed).

Start the Docker daemon (or Docker Desktop on Mac), then run again.
Or use your own Postgres: SKIP_DOCKER=1 with DATABASE_URL in .env
`);
    process.exit(1);
}

await main();
