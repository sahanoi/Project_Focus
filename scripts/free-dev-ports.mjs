/**
 * Frees local TCP listeners on dev ports (Node/Vite from dead terminals).
 * Ports default to API + Vite; override: DEV_FREE_PORTS=3001,5173,5174
 * Skip entirely: set SKIP_FREE_DEV_PORTS=1
 * Only print what would be killed: DEV_FREE_PORTS_DRYRUN=1
 */
import { execFileSync, execSync } from 'node:child_process';

const skip =
    process.env.SKIP_FREE_DEV_PORTS === '1' || /^true$/i.test(String(process.env.SKIP_FREE_DEV_PORTS ?? ''));
if (skip) {
    process.exit(0);
}

const dryRun =
    process.env.DEV_FREE_PORTS_DRYRUN === '1' || /^true$/i.test(String(process.env.DEV_FREE_PORTS_DRYRUN ?? ''));

const defaultPorts = [3001, 5173];
const ports = (process.env.DEV_FREE_PORTS
    ? process.env.DEV_FREE_PORTS.split(',')
    : defaultPorts.map(String)
)
    .map((p) => parseInt(String(p).trim(), 10))
    .filter((n) => n > 0 && n < 65536);
if (ports.length === 0) {
    process.exit(0);
}

const win = process.platform === 'win32';

const MAX_INFO_LEN = 220;

function truncate(s) {
    if (!s) return '';
    const t = s.replace(/\r?\n/g, ' ').trim();
    return t.length > MAX_INFO_LEN ? `${t.slice(0, MAX_INFO_LEN)}…` : t;
}

/** Best-effort: which executable / cwd shows up in the command line (helps tell projects apart). */
function describePidWin(pid) {
    try {
        const ps = [
            '$p=Get-CimInstance Win32_Process -Filter "ProcessId=' + pid + '" -ErrorAction SilentlyContinue',
            'if(-not$p){"(no longer running)"; exit}',
            '"$($p.Name) | $($p.ExecutablePath) | $($p.CommandLine)"',
        ].join('; ');
        const out = execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], {
            encoding: 'utf8',
        }).trim();
        return truncate(out);
    } catch {
        return '';
    }
}

function describePidNix(pid) {
    try {
        return truncate(execFileSync('ps', ['-p', pid, '-ww', '-o', 'comm=,args='], { encoding: 'utf8' }));
    } catch {
        return '';
    }
}

const describePid = win ? describePidWin : describePidNix;

/**
 * Windows: netstat column layout can vary; PowerShell is reliable for LocalPort + Listen.
 */
function pidsOnPortWinPs(port) {
    try {
        const cmd = [
            'Get-NetTCPConnection -LocalPort ' + String(port) + ' -State Listen -ErrorAction SilentlyContinue',
            '| ForEach-Object { $_.OwningProcess }',
        ].join(' ');
        const out = execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', cmd], {
            encoding: 'utf8',
        });
        return [...new Set(out.split(/\r?\n/).map((s) => s.trim()).filter((s) => /^\d+$/.test(s) && s !== '0'))];
    } catch {
        return [];
    }
}

function pidsOnPortWinNetstat(port) {
    const out = execFileSync('netstat', ['-ano', '-p', 'tcp'], { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
        const t = line.trim();
        if (!t.startsWith('TCP') || !t.includes('LISTENING')) continue;
        const parts = t.split(/\s+/);
        if (parts.length < 5) continue;
        const local = parts[1];
        const portMatch = local.match(/:(\d+)$/);
        if (!portMatch || Number(portMatch[1]) !== port) continue;
        const idx = parts.indexOf('LISTENING');
        if (idx === -1 || idx + 1 >= parts.length) continue;
        const p = parts[idx + 1];
        if (/^\d+$/.test(p) && p !== '0') pids.add(p);
    }
    return [...pids];
}

function pidsOnPortWin(port) {
    const a = pidsOnPortWinPs(port);
    if (a.length > 0) return a;
    return pidsOnPortWinNetstat(port);
}

function pidsOnPortNix(port) {
    try {
        const out = execFileSync('lsof', ['-iTCP', `:${port}`, '-sTCP:LISTEN', '-t', '-n', '-P'], {
            encoding: 'utf8',
        });
        return out
            .split(/\n/)
            .map((s) => s.trim())
            .filter(Boolean);
    } catch {
        return [];
    }
}

const pidsOnPort = win ? pidsOnPortWin : pidsOnPortNix;
/** { port, pid } for logging (same pid on two ports => two lines). */
const work = [];
const uniquePids = new Set();
for (const port of ports) {
    for (const pid of pidsOnPort(port)) {
        work.push({ port, pid });
        uniquePids.add(pid);
    }
}

if (work.length === 0) {
    if (dryRun) {
        console.log(`[dev] No listeners on ports: ${ports.join(', ')}`);
    } else {
        console.log(`[dev] Dev ports clear (nothing listening on ${ports.join(', ')})`);
    }
    process.exit(0);
}

if (dryRun) {
    console.log('[dev] DRYRUN — would free these listeners (set DEV_FREE_PORTS_DRYRUN=0 or unset to actually kill):');
}
for (const { port, pid } of work) {
    const info = describePid(pid) || 'run tasklist or Get-Process to inspect';
    console.log(`[dev] port ${port} — pid ${pid} — ${info}`);
}
if (dryRun) {
    process.exit(0);
}

for (const pid of uniquePids) {
    try {
        if (win) {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
        } else {
            execFileSync('kill', ['-9', pid], { stdio: 'pipe' });
        }
        const label = win ? 'taskkill' : 'SIGKILL';
        console.log(`[dev] Stopped (pid ${pid}, ${label})`);
    } catch (e) {
        console.error(`[dev] Could not stop pid ${pid} (is another app using this port as admin only?) — ${e}`);
    }
}
