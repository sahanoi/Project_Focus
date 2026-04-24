/**
 * Local dev entry: ensure .env, ensure Docker engine (starts Docker Desktop on Windows if needed),
 * docker compose up Postgres, wait for port, migrate, seed dev user if missing,
 * free dev ports 3001/5173 (stale Node), then Vite + API.
 * SKIP_DOCKER=1 skips Docker/Compose when Postgres is already reachable at DATABASE_URL.
 * SKIP_FREE_DEV_PORTS=1 skips killing listeners on those ports (e.g. two projects at once).
 * DEV_FREE_PORTS_DRYRUN=1 only logs which processes hold the ports, does not kill.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
/** Windows: spawnSync(npm.cmd, …, shell:false) often yields status null even on success. */
const npmShell = process.platform === 'win32';

function run(label, args, opts = {}) {
    const useShell = args[0] === npmCmd ? npmShell : false;
    const r = spawnSync(args[0], args.slice(1), {
        cwd: root,
        stdio: 'inherit',
        shell: useShell,
        ...opts,
    });
    if (r.status !== 0) {
        process.exit(r.status ?? 1);
    }
}

function prepareDatabase() {
    console.log('[dev] Postgres: waiting for TCP…');
    run('db:wait', [npmCmd, 'run', 'db:wait']);
    console.log('[dev] Postgres OK');

    console.log('[dev] Running migrations…');
    run('db:migrate', [npmCmd, 'run', 'db:migrate']);
    console.log('[dev] Migrations OK');

    console.log('[dev] Ensuring dev user exists (if missing)…');
    run('db:seed:if-missing', [npmCmd, 'run', 'db:seed:if-missing']);
    console.log('[dev] Dev user step OK');
}

run('ensure-local-env', [process.execPath, path.join(root, 'scripts', 'ensure-local-env.mjs')]);

const skip =
    process.env.SKIP_DOCKER === '1' ||
    /^true$/i.test(String(process.env.SKIP_DOCKER ?? ''));

if (skip) {
    console.log(
        'SKIP_DOCKER=1 — skipping docker compose. Ensure DATABASE_URL points at a running Postgres.\n',
    );
    prepareDatabase();
    run('free-dev-ports', [process.execPath, path.join(root, 'scripts', 'free-dev-ports.mjs')]);
    console.log('[dev] Starting Vite + API…');
    run('dev:app', [npmCmd, 'run', 'dev:app']);
    process.exit(0);
}

run('ensure-docker', [process.execPath, path.join(root, 'scripts', 'ensure-docker.mjs')]);

const up = spawnSync(npmCmd, ['run', 'db:up'], {
    cwd: root,
    stdio: 'inherit',
    shell: npmShell,
});
if (up.status !== 0) {
    console.error(`
Docker did not start the database (Docker Desktop may be closed or the engine unreachable).

Fix one of these:
  • Start Docker Desktop, wait until it is ready, then run: npm run dev
  • Or use Postgres you already have: set SKIP_DOCKER=1 and ensure DATABASE_URL in .env is correct
    PowerShell:  $env:SKIP_DOCKER="1"; npm run dev
`);
    process.exit(up.status ?? 1);
}

prepareDatabase();
run('free-dev-ports', [process.execPath, path.join(root, 'scripts', 'free-dev-ports.mjs')]);
console.log('[dev] Starting Vite + API…');
run('dev:app', [npmCmd, 'run', 'dev:app']);
