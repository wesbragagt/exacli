---
name: exacli
description: Exa AI search API via CLI. Activate when user wants to search the web, find code examples, extract content from websites, get AI answers with sources, or run deep multi-step research. Examples: "search for AI startups", "find rate limiter code in Go", "extract content from this URL", "research this topic", "find similar pages".
---

# Exacli

## Rules

1. Match output format to context: use default for metadata-only results, `--toon` when fetching content, `--json` only when piping to `jq`
2. User must have setup `exacli login` to store in OS keychain
3. Use `--text` to include full content, `--highlights` for snippets
4. Use `--type deep`/`deep-lite`/`deep-reasoning` on `search` for multi-step research with synthesis; it's synchronous, no polling needed

## Command Selection

Pick the right command first — wrong command = wrong output:

| Goal | Command |
|------|---------|
| Find code examples / implementations | `exacli code` |
| Web search with content | `exacli search --text` or `--highlights` |
| Get a synthesized answer with citations | `exacli answer` |
| Deep multi-step research report | `exacli search --type deep-reasoning --system-prompt "..."` |
| Fetch specific URL content | `exacli contents <url>` |
| Find pages similar to a URL | `exacli similar <url>` |

## Output Modes

Measured on 10 results with no content flags (`--text`/`--highlights`/`--summary` off):

| Flag | Chars | Est. tokens | Best for |
|------|-------|-------------|----------|
| _(none)_ | ~3,300 | ~830 | Agent contexts with metadata only — omits null/empty fields |
| `--toon` | ~4,200 | ~1,050 | Agent contexts with content — flat `key: value`, no formatting overhead |
| `--json` | ~5,000 | ~1,250 | Scripting only — most verbose due to null fields + structural chars |

**Key insight:** `--json` is ~50% larger than the default for the same data because it includes `"highlights": null`, `"highlightScores": null`, `"text": ""`, `"summary": ""` on every result. Prefer default or `--toon` to keep context small; reach for `--json` only when piping to `jq`.

```bash
# Metadata-only: default is most compact
exacli search "query"

# With content: --toon is most compact
exacli search "query" --text --toon

# Scripting: --json when you need jq field extraction
exacli search "query" --json | jq '.results[] | {title, url}'
exacli search "query" --type deep --json | jq '{status, output}'
```

## Commands

### code

Search for code examples using the Exa Code API. Use this when the user needs actual code, implementations, or code-focused results — not `search`.

```bash
exacli code <query> [options]
```

| Option | Description |
|--------|-------------|
| `--tokens-num <n>` | Token budget: `dynamic`, `1000`, `5000`, `50000` (default: `dynamic`) |

### search

```bash
exacli search "query" [options]
```

| Option | Description |
|--------|-------------|
| `--num-results <n>` | Number of results (default: 10) |
| `--type <auto\|neural\|keyword\|hybrid\|fast\|instant\|deep\|deep-lite\|deep-reasoning>` | Search type |
| `--text` | Include full text content |
| `--highlights` | Include relevant highlights |
| `--summary` | Include AI-generated summary |
| `--category <category>` | Filter by category |
| `--include-domains <list>` | Comma-separated domains to include |
| `--exclude-domains <list>` | Comma-separated domains to exclude |
| `--start-date <date>` | Start date (ISO format) |
| `--end-date <date>` | End date (ISO format) |
| `--autoprompt` | Use autoprompt to enhance query |
| `--output-schema <json\|path>` | JSON schema for structured synthesis output (deep modes) |
| `--system-prompt <text>` | System prompt guiding synthesis output (deep modes) |

### contents

Retrieve content from specific URLs.

```bash
exacli contents <url...> [options]
```

Options: `--text`, `--highlights`, `--summary`, `--max-age-hours <n>`

### similar

Find pages similar to a given URL.

```bash
exacli similar <url> [options]
```

Options: `--num-results <n>`, `--exclude-source-domain`, `--text`, `--highlights`, `--summary`, `--category <category>`

### answer

Get AI-powered answers with source citations.

```bash
exacli answer "query" [options]
```

Options: `--text`, `--model <exa|exa-pro>`, `--stream`, `--system-prompt <text>`

### login / logout

```bash
exacli login    # store API key in OS keychain
exacli logout   # remove API key from OS keychain
```

## Global Flags

| Flag | Description |
|------|-------------|
| `--api-key <key>` | Exa API key |
| `--json` | Output raw JSON |
| `--toon` | Output compact TOON format |
| `-h, --help` | Show help |

## Search Categories

`company`, `research paper`, `news`, `pdf`, `tweet`, `personal site`, `financial report`, `people`

## Search Types

| Type | Description |
|------|-------------|
| `auto` | Automatically chosen (default) |
| `fast` | Quick results |
| `instant` | Lowest latency |
| `deep-lite` | Multi-step research with synthesis, ~4s latency |
| `deep` | Comprehensive multi-step research with synthesis |
| `deep-reasoning` | Enhanced reasoning for harder analysis tasks, ~12-40s latency |

Pair a deep type with `--system-prompt` or `--output-schema` to shape the synthesized answer, returned in `output.content` on the response.

## Common Patterns

```bash
# Code search (use code, not search, for code examples)
exacli code "rate limiter implementation Go" --tokens-num 5000

# Semantic search with content
exacli search "AI startups" --num-results 5 --text --toon

# Deep search for research
exacli search "transformer architecture" --type deep --highlights --toon

# Filter by category and date
exacli search "startup funding" --category news --start-date 2024-01-01

# Domain-specific search
exacli search "AI research papers" --include-domains "arxiv.org,openai.com"

# Extract content from URLs
exacli contents "https://example.com/article" --text --toon

# Find similar pages
exacli similar "https://openai.com/research" --exclude-source-domain

# AI-powered answers
exacli answer "What is quantum computing?" --stream

# Deep multi-step research with synthesis (no polling needed)
exacli search "Latest AI developments" --type deep-reasoning --system-prompt "Summarize key developments"
```
