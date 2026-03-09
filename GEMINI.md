# Antigravity Agent Instructions — Project Focus

## Git & Version Control

**Default behaviour:** After completing any set of code changes, always stage, commit, and push to GitHub under the user's configured git identity (`xsaha` / `xsahan.oi@gmail.com`) on the `main` branch — **unless the user explicitly says otherwise**.

### Commit workflow to follow every time:

1. Stage only the files that were actually changed:
   ```
   git add <changed files>
   ```
2. Write a clear conventional commit message:
   ```
   git commit -m "feat|fix|chore|refactor: short description"
   ```
3. Push to remote:
   ```
   git push origin main
   ```

### Rules:
- Never use `&&` chaining in PowerShell — run each git command as a **separate** `run_command` call.
- Always verify the push succeeded by checking command output for `main -> main`.
- If there are **unrelated** modified files that were not touched in the current task, still stage and include them in the same commit unless the user has explicitly asked you to keep them separate.
- Never force-push (`--force`) without explicit user permission.
- Do **not** push if the user says "don't push yet" or similar.

## General Rules

- Always read `docs/` at the start of a new session to understand the current project state.
- Use conventional commit prefixes: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `test`.
