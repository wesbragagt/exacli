# PRD: Cross-Platform Binary Compilation

## Overview

exacli already has cross-platform compilation infrastructure: `task compile:all` in Taskfile.yml and a release workflow in `.github/workflows/release.yml`. This PRD covers the gaps that remain before the pipeline is stable and complete.

## Current State

### Taskfile.yml `compile:all`
6 targets (outputs to `dist/`):
- `bun-linux-x64` → `dist/exacli-linux-x64`
- `bun-linux-arm64` → `dist/exacli-linux-arm64`
- `bun-darwin-x64` → `dist/exacli-darwin-x64`
- `bun-darwin-arm64` → `dist/exacli-darwin-arm64`
- `bun-windows-x64` → `dist/exacli-windows-x64.exe`
- `bun-windows-arm64` → `dist/exacli-windows-arm64.exe`

### release.yml matrix
6 targets with runners:
- `ubuntu-latest` for linux-x64, darwin-x64, windows-x64, windows-arm64 (cross-compiled)
- `ubuntu-24.04-arm` for linux-arm64 (native)
- `macos-15` for darwin-arm64 (native)

Outputs to working directory as `exacli-<os>-<arch>[.exe]`. Artifacts uploaded, then collected and attached to a GitHub release.

## Decision Point: Musl vs Windows

The feature request described 6 platforms as "macOS arm64/x64, Linux arm64/x64/musl arm64/musl x64" — implying musl variants instead of Windows. The existing code targets Windows instead of musl. This PRD treats resolving this discrepancy as the first task.

Options:
- **A** — Keep Windows, add musl (8 targets total)
- **B** — Replace Windows with musl (6 targets, no Windows)
- **C** — Keep Windows only (no change to target set)

The audit task must capture the decision before any other changes are made.

## Goals

1. Reconcile the intended target platform list
2. Align Taskfile `compile:all` with the final target list
3. Align `release.yml` matrix with the final target list
4. Add SHA256 checksum generation for release artifacts
5. Ensure naming conventions are consistent across Taskfile and release workflow

## Functional Requirements

- `task compile:all` produces one binary per target platform
- Binary naming follows `exacli-<os>-<arch>[.exe]` pattern consistently
- `release.yml` uses native runners for targets that require them (darwin-arm64, linux-arm64)
- Release artifacts include SHA256 checksums file
- All GitHub Actions use SHA-pinned action references (per `.github/CLAUDE.md`)

## Technical Considerations

- Bun cross-compilation: `bun build --compile --target=<bun-target>` supports cross-compilation for most targets from Linux
- Musl targets: Bun supports `bun-linux-x64-musl` and `bun-linux-arm64-musl` as `--target` values
- Darwin arm64 currently requires a native macOS runner (`macos-15`) because cross-compiling to darwin from Linux is not supported by Bun
- The release workflow verifies CI passed before building — this must remain intact
- Any workflow edits must pin all action references to full 40-char commit SHAs

## Success Metrics

- `task compile:all` completes without error locally
- `release.yml` produces binaries for all agreed platforms on tag push
- GitHub release includes one binary per platform plus a checksums file
- No workflow uses tag-based action references (all SHA-pinned)
