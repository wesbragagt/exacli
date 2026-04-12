# Platform Targets

exacli ships binaries for 8 platforms via `task compile:all` and the release workflow.
All targets are cross-compiled with `CGO_ENABLED=0` using the standard Go toolchain.

## Decision Record

**Option A chosen**: Keep Windows targets + add musl variants (8 total).

- Preserves Windows coverage for existing users
- Adds musl variants for Alpine Linux / Docker environments
- All targets can be cross-compiled from any platform with Go installed

## Target List

| GOOS/GOARCH                        | Output file                    |
|------------------------------------|-------------------------------|
| `linux/amd64`                      | `exacli-linux-x64`            |
| `linux/arm64`                      | `exacli-linux-arm64`          |
| `linux/amd64` (static)             | `exacli-linux-x64-musl`       |
| `linux/arm64` (static)             | `exacli-linux-arm64-musl`     |
| `darwin/amd64`                     | `exacli-darwin-x64`           |
| `darwin/arm64`                     | `exacli-darwin-arm64`         |
| `windows/amd64`                    | `exacli-windows-x64.exe`      |
| `windows/arm64`                    | `exacli-windows-arm64.exe`    |

musl variants are built with `-extldflags=-static` for fully static binaries.

## Naming Convention

`exacli-<os>-<arch>[.exe]`

- musl variants use `<arch>-musl` suffix (e.g. `exacli-linux-x64-musl`)
- Windows binaries include `.exe` extension
