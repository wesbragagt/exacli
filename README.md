# Exacli

A Go CLI for the [Exa AI](https://exa.ai) search API. Search the web semantically, extract content from URLs, get AI-powered answers with citations, and run deep multi-step research with `search --type deep` — all from your terminal. Statically linked, no external package dependencies. API key stored in your OS keychain (macOS Keychain, GNOME Keyring, KWallet).

> **Attribution:** Based on [exacli](https://github.com/SoftwareStartups/exacli).

## Demo

![exacli demo](./assets/demo-exacli.gif)

## Quick Start

**Have Nix?**

```bash
git clone https://github.com/wesbragagt/exacli.git
cd exacli
nix build . -o build/nix
cp build/nix/bin/exacli ~/.local/bin/
exacli --version
```

**Have Go 1.25+?**

```bash
git clone https://github.com/wesbragagt/exacli.git
cd exacli
make install
exacli --version
```

Then authenticate and search:

```bash
exacli login                          # store API key in OS keychain
exacli search "latest AI news"
```

Get your key at [https://dashboard.exa.ai/api-keys](https://dashboard.exa.ai/api-keys).

## What v3 adds

Compared with the previous CLI, v3 lets you explicitly select Lite search, request cross-result Dynamic Highlights, and read structured entities without losing their properties. It also fixes content retrieval on `search` using the existing flags.

| Capability | Previous CLI | v3 |
|------------|--------------|----|
| Select low-cost cached-content search | Rejected `--type lite` before sending a request | Accepts `--type lite` with supported filters, text, and highlights |
| Request cross-result Dynamic Highlights | Had no explicit option or required beta header | `--dynamic-highlights` requests dynamic highlights and sends the opt-in header |
| Retrieve search text, highlights, and summaries | Sent extraction options at the wrong request level; the API could ignore them | Sends nested `contents` options so existing `--text`, `--highlights`, and `--summary` flags request the content correctly |
| Read structured result entities | Discarded `results[].entities` during response decoding | Preserves complete entity objects in JSON, non-null leaves in TOON, and a JSON array in markdown |

Try the new capabilities with these commands. They require a valid API key and available credits; returned content and entities depend on the query and Exa's response.

```bash
# Select Lite and retrieve relevant snippets
exacli search "Exa 3.0 release features" --type lite --highlights --num-results 1 --json

# Request cross-result Dynamic Highlights without a separate --highlights flag
exacli search "Exa 3.0 release features" --type lite --dynamic-highlights --toon

# Retrieve summaries using the corrected search content request
exacli search "Exa 3.0 release features" --type auto --summary --num-results 1 --json

# Read place entities, such as addresses, hours, and ratings, when returned
exacli search "ramen restaurants in San Francisco Mission district" --type lite --highlights --json
```

For the last command, omit `--json` to inspect the markdown Entities section, or replace it with `--toon` for flattened entity fields. V3 preserves unknown entity types and properties rather than limiting results to a fixed place schema.

Lite does not support enabled `--summary` or `--autoprompt`, or nonempty `--output-schema` or `--system-prompt`. Use Auto for summaries and the existing deep modes for synthesis. Dynamic Highlights implies highlight retrieval even with `--highlights=false`.

The default search mode, existing commands, and previously accepted search types are unchanged. Exa's expanded index coverage applies server-side; it is not a new CLI endpoint. V3 still uses `https://api.exa.ai/search` and adds no dedicated places, products, weather, or flights commands.

---

## Why Go?

The original required Bun and kept segfaulting inside a sandboxed harness — that was enough. Go gives you a tiny static binary you can cross-compile for any platform with one command (`make compile-all`), no runtime babysitting required. I'm also just biased: Go is my favorite way to write a CLI.

## Installation

### With Nix

If you have [Nix](https://nixos.org) installed, you can run exacli directly without any other prerequisites:

```bash
nix run github:wesbragagt/exacli -- search "latest AI news"
```

Or install it into your profile:

```bash
nix profile install github:wesbragagt/exacli
```

## Use with AI Assistants

Exacli ships with pre-built skill files under `guides/` that let AI coding assistants invoke exacli commands on your behalf. Copy the relevant directory to your project — no edits needed. Make sure you've run `exacli login` first to store your API key in the OS keychain.

### Claude Code

```bash
cp -r guides/.claude/skills/exacli /path/to/your/project/
```

This places the skill at `.claude/skills/exacli/SKILL.md`, which Claude Code discovers automatically.

### Other tools

| Tool | What to copy | Destination |
|------|-------------|-------------|
| **opencode** | `SKILL.md` | `.opencode/skill/exacli/SKILL.md` |
| **Cursor** | `SKILL.md` | `.cursor/rules/exacli.mdc` (or append to `.cursorrules`) |

The YAML frontmatter (`name`, `description`) at the top of `SKILL.md` is used by tools that support it and safely ignored by those that don't.

## Commands

### `code <query>`

Search code using the Exa Code API. Returns a single merged block of code snippets, documentation, and explanations sourced from GitHub, Stack Overflow, and official docs — optimised for stuffing directly into an LLM context window.

```bash
exacli code "how to use cobra CLI in Go"
exacli code "React useEffect cleanup pattern" --tokens-num 5000
exacli code "postgres connection pooling in Go" --json
```

**Options:** `--tokens-num <dynamic|1000|5000|50000>` (default: `dynamic`)

**vs `search`:**

| | `code` | `search` |
|---|---|---|
| Returns | One merged context block | Separate result objects |
| Content | Full code + explanations | URLs only (unless `--text`) |
| Token control | `--tokens-num` budget | — |
| Agent-ready | Drop straight into context | Need to fetch each URL |

### `search <query>`

Search the web using semantic search.

```bash
exacli search "latest AI developments"
exacli search "machine learning papers" --type deep --text --highlights
exacli search "startup funding" --category news --start-date 2024-01-01
exacli search "AI research" --include-domains "arxiv.org,openai.com"
exacli search "restaurant ratings" --type lite --dynamic-highlights --toon
exacli search "trends in quantum computing" --type deep-reasoning --output-schema '{"type":"text","description":"Summarize key trends"}'
```

**Options:** `--num-results <n>`, `--type <auto|neural|keyword|hybrid|fast|instant|lite|deep|deep-lite|deep-reasoning>`, `--text`, `--highlights`, `--dynamic-highlights`, `--summary`, `--category <category>`, `--include-domains <list>`, `--exclude-domains <list>`, `--start-date <date>`, `--end-date <date>`, `--autoprompt`, `--output-schema <json|path>`, `--system-prompt <text>`

Use `--output-schema` to receive synthesized `output.content`. Use `--system-prompt` to guide synthesis and deep-search planning.

`--type lite` selects the low-cost cached-content mode. It supports text and highlights but rejects `--summary`, `--autoprompt`, `--output-schema`, and `--system-prompt`. Explicitly false summary and autoprompt flags are allowed. The default search mode is unchanged; legacy `fast` and `instant` remain accepted without translation to Lite.

`--dynamic-highlights` requests cross-result Dynamic Highlights and implies `--highlights`, even with `--highlights=false`. The CLI sends the required beta header only for this option. Ordinary highlights remain unchanged.

When Exa returns structured entities, `--json` preserves complete objects in `results[].entities`. `--toon` includes their non-null leaves under `results.<i>.entities.<j>`. Default markdown includes an Entities section with the complete JSON array. Entity types and properties depend on the returned results.

### `contents <url...>`

Retrieve content from specific URLs.

```bash
exacli contents "https://arxiv.org/abs/2304.15004" --text
exacli contents "https://example.com/1" "https://example.com/2" --highlights --summary
```

**Options:** `--text`, `--highlights`, `--summary`, `--max-age-hours <n>`

### `similar <url>`

Find pages similar to a given URL.

```bash
exacli similar "https://openai.com/research/gpt-4"
exacli similar "https://techcrunch.com/article" --exclude-source-domain --text
```

**Options:** `--num-results <n>`, `--exclude-source-domain`, `--text`, `--highlights`, `--summary`, `--category <category>`

### `answer <query>`

Get AI-powered answers with source citations.

```bash
exacli answer "What is quantum computing?"
exacli answer "Explain neural networks" --stream
exacli answer "Compare transformer architectures" --model exa-pro
```

**Options:** `--text`, `--model <exa|exa-pro>`, `--stream`, `--system-prompt <text>`

### `login` / `logout`

Store or remove your Exa API key in the OS keychain.

```bash
exacli login
exacli logout
```

## Global Options

| Flag | Description |
|------|-------------|
| `--api-key <key>` | Exa API key (overrides keychain) |
| `--json` | Output raw JSON instead of formatted markdown |
| `--toon` | Output compact TOON format |
| `--version` | Show version information |
| `-h, --help` | Show help message |

### Output Format Trade-offs

The three formats make different token/size trade-offs that matter when output flows into an AI context window.

Measured on a 10-result metadata-only search (no `--text`, `--highlights`, `--summary`):

| Format | Characters | Est. tokens | When to use |
|--------|-----------|-------------|-------------|
| Default (markdown) | ~3,300 | ~830 | Best baseline — omits null/empty fields entirely |
| `--toon` | ~4,200 | ~1,050 | Includes empty fields as flat `key: value` pairs |
| `--json` | ~5,000 | ~1,250 | Most verbose — includes all nulls + structural overhead |

**Why JSON is largest:** every result carries `"highlights": null`, `"highlightScores": null`, `"text": ""`, and `"summary": ""` even when empty, plus JSON structural characters (quotes, brackets, commas on every key).

**Why default markdown is smallest for sparse results:** the formatter skips null and empty fields entirely, emitting only populated data.

**When the ranking shifts:** once results include actual content (`--text`, `--highlights`, `--summary`), `--toon` becomes the most compact option because it uses flat `key: value` lines with no markdown formatting overhead (no section headers, no bold labels per field).

**Recommendations:**

| Use case | Best format |
|----------|-------------|
| AI agent, metadata only | Default (markdown) |
| AI agent, with content | `--toon` |
| Scripting / field extraction | `--json \| jq` |
| Human reading | Default (markdown) |

## Development

Prerequisites: [Go 1.25+](https://go.dev/dl/)

```bash
make build        # build/exacli
make install      # build + cp ~/.local/bin/
make clean        # remove build/
```

## License

MIT - see [LICENSE](LICENSE) for details.
