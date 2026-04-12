# Task: Update Taskfile compile:all

## Goal

Update `compile:all` in `Taskfile.yml` to reflect the final target list from `audit-targets`.

## Current State

```yaml
compile:all:
  desc: Compile for all platforms
  cmds:
    - mkdir -p dist
    - bun build src/index.ts --compile --target=bun-linux-x64 --outfile dist/exacli-linux-x64
    - bun build src/index.ts --compile --target=bun-linux-arm64 --outfile dist/exacli-linux-arm64
    - bun build src/index.ts --compile --target=bun-darwin-x64 --outfile dist/exacli-darwin-x64
    - bun build src/index.ts --compile --target=bun-darwin-arm64 --outfile dist/exacli-darwin-arm64
    - bun build src/index.ts --compile --target=bun-windows-x64 --outfile dist/exacli-windows-x64.exe
    - bun build src/index.ts --compile --target=bun-windows-arm64 --outfile dist/exacli-windows-arm64.exe
```

## Changes Required

1. Add or replace entries based on `audit-targets` decision.
2. If musl targets are added: use naming `exacli-linux-x64-musl` and `exacli-linux-arm64-musl` for consistency.
3. Keep `dist/` output directory pattern.

## Naming Convention

Follow `exacli-<os>-<arch>[<variant>][.exe]`:
- `exacli-linux-x64`
- `exacli-linux-arm64`
- `exacli-linux-x64-musl` (if included)
- `exacli-linux-arm64-musl` (if included)
- `exacli-darwin-x64`
- `exacli-darwin-arm64`
- `exacli-windows-x64.exe` (if included)
- `exacli-windows-arm64.exe` (if included)

## Verification

After editing, run `task compile:all` locally (on a machine with Bun installed) and confirm all output files appear in `dist/`.
