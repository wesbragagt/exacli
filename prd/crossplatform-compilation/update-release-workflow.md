# Task: Update release.yml Matrix and Add Checksums

## Goal

Update `.github/workflows/release.yml` to reflect the final target list from `audit-targets` and generate SHA256 checksums for all release artifacts.

## Constraints

- All action `uses:` references must be full 40-char commit SHAs per `.github/CLAUDE.md`
- Resolve current SHA for any new actions with:
  ```bash
  gh api "repos/<owner>/<action>/git/ref/tags/<tag>" --jq '.object.sha'
  ```
- The CI verification step (polling for CI run, then `gh run watch`) must remain intact

## Current Matrix

| target | runner | os | arch | ext |
|---|---|---|---|---|
| bun-linux-x64 | ubuntu-latest | linux | x64 | |
| bun-linux-arm64 | ubuntu-24.04-arm | linux | arm64 | |
| bun-darwin-x64 | ubuntu-latest | darwin | x64 | |
| bun-darwin-arm64 | macos-15 | darwin | arm64 | |
| bun-windows-x64 | ubuntu-latest | windows | x64 | .exe |
| bun-windows-arm64 | ubuntu-latest | windows | arm64 | .exe |

## Matrix Changes

Add or replace entries per `audit-targets` decision. For musl entries use:
```yaml
- runner: ubuntu-latest
  target: bun-linux-x64-musl
  os: linux
  arch: x64-musl
  ext: ""
- runner: ubuntu-latest   # verify if native runner needed
  target: bun-linux-arm64-musl
  os: linux
  arch: arm64-musl
  ext: ""
```

Binary name pattern: `exacli-${{ matrix.os }}-${{ matrix.arch }}${{ matrix.ext }}`

## Checksum Generation

Add a step in the `release` job after artifact download, before `gh release create`:

```yaml
- name: Generate checksums
  run: |
    cd artifacts
    sha256sum * > SHA256SUMS.txt
    cat SHA256SUMS.txt
```

Then include `SHA256SUMS.txt` in the release upload:
```yaml
run: gh release create "$TAG_NAME" artifacts/* --generate-notes --repo "$REPO"
```
(The glob `artifacts/*` already picks up `SHA256SUMS.txt` if it is inside `artifacts/`.)

## Verification

Push a `v*` tag to a test branch or run the workflow manually (if `workflow_dispatch` is added) to confirm:
- All matrix targets produce binaries
- `SHA256SUMS.txt` appears in the GitHub release
- Release notes are auto-generated
