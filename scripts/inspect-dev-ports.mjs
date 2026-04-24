/**
 * List whatever is listening on the default dev ports (and DEV_FREE_PORTS if set) without killing.
 * Same output as the first part of free-dev-ports with DEV_FREE_PORTS_DRYRUN=1.
 */
process.env.DEV_FREE_PORTS_DRYRUN = '1';
await import('./free-dev-ports.mjs');
