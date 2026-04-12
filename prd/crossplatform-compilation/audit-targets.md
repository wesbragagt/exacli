# Task: Audit Target Platforms

## Goal

Decide the canonical platform target list before any Taskfile or workflow changes. Document the decision so `update-taskfile` and `update-release-workflow` have a single source of truth.

## Steps

1. Confirm which Bun target strings are valid for the desired platforms. Run `bun build --help` or check https://bun.sh/docs/bundler/executables for the full list.
2. Choose one of the three options from the PRD decision point:
   - **A** — Keep Windows targets, add musl (8 total)
   - **B** — Replace Windows with musl (6 total)
   - **C** — Keep Windows only (no change)
3. Document the final list in a comment or table inside Taskfile.yml or in a new `PLATFORMS.md`.

## Known Bun Target Strings

| Platform | Bun target | Needs native runner |
|---|---|---|
| Linux x64 | `bun-linux-x64` | No (cross from ubuntu-latest) |
| Linux arm64 | `bun-linux-arm64` | Yes (`ubuntu-24.04-arm`) |
| Linux x64 musl | `bun-linux-x64-musl` | No (cross from ubuntu-latest) |
| Linux arm64 musl | `bun-linux-arm64-musl` | Verify |
| macOS x64 | `bun-darwin-x64` | No (cross from ubuntu-latest) |
| macOS arm64 | `bun-darwin-arm64` | Yes (`macos-15`) |
| Windows x64 | `bun-windows-x64` | No (cross from ubuntu-latest) |
| Windows arm64 | `bun-windows-arm64` | No (cross from ubuntu-latest) |

## Output

A decision record: which targets, which Bun strings, which runner each needs. This feeds directly into the next two tasks.
