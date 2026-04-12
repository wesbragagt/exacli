# GitHub Configuration

## SHA Pinning Policy

All actions pinned to **full 40-character commit SHAs**. Tags are mutable and can be hijacked — SHAs are immutable.

Format: `uses: owner/action@<full-sha>  # v1.2.3`

Resolve latest version and SHA:

```bash
for repo in actions/checkout actions/setup-go arduino/setup-task; do
  tag=$(gh api "repos/$repo/releases/latest" --jq '.tag_name')
  ref=$(gh api "repos/$repo/git/ref/tags/$tag" --jq '.object')
  type=$(echo "$ref" | jq -r '.type')
  sha=$(echo "$ref" | jq -r '.sha')
  if [ "$type" = "tag" ]; then
    sha=$(gh api "repos/$repo/git/tags/$sha" --jq '.object.sha')
  fi
  echo "$repo@$tag → $sha"
done
```

## CI Workflow (`workflows/ci.yml`)

- Triggers: push to any branch, PRs to `main`
- Permissions: `contents: read` only
- Jobs: check (lint + test) → build
- Uses `actions/setup-go` with `go-version-file: go.mod` and dependency caching
- Uses `arduino/setup-task` for the `task` runner
- Task commands: `task lint` (`go vet ./...`), `task test` (`go test ./...`), `task build`

## No Release Workflow

Releases are not automated. Users build from source — see README.
