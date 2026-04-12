# Platform Targets

exacli ships binaries for 8 platforms via `task compile:all` and the release workflow.

## Decision Record

**Option A chosen**: Keep Windows targets + add musl variants (8 total).

- Preserves Windows coverage for existing users
- Adds musl variants for Alpine Linux / Docker environments
- All targets can be cross-compiled from `ubuntu-latest` or `ubuntu-24.04-arm`

## Target List

| Bun target              | Output file                    | Runner               |
|-------------------------|-------------------------------|----------------------|
| `bun-linux-x64`         | `exacli-linux-x64`            | `ubuntu-latest`      |
| `bun-linux-arm64`       | `exacli-linux-arm64`          | `ubuntu-24.04-arm`   |
| `bun-linux-x64-musl`    | `exacli-linux-x64-musl`       | `ubuntu-latest`      |
| `bun-linux-arm64-musl`  | `exacli-linux-arm64-musl`     | `ubuntu-24.04-arm`   |
| `bun-darwin-x64`        | `exacli-darwin-x64`           | `ubuntu-latest`      |
| `bun-darwin-arm64`      | `exacli-darwin-arm64`         | `macos-15`           |
| `bun-windows-x64`       | `exacli-windows-x64.exe`      | `ubuntu-latest`      |
| `bun-windows-arm64`     | `exacli-windows-arm64.exe`    | `ubuntu-latest`      |

## Naming Convention

`exacli-<os>-<arch>[.exe]`

- musl variants use `<arch>-musl` suffix (e.g. `exacli-linux-x64-musl`)
- Windows binaries include `.exe` extension
