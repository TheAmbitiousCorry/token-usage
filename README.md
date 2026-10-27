# token-usage

A Claude Code mod that lets the model, and any subagent, read the session's token usage.

It adds three things:

- A tool, `mcp__token-usage__usage`, in the model's tool list from the first prompt. It returns the context window fill, the session cost so far, and each rate-limit window with its reset time.
- One line in the system prompt on every request: the context fill rounded down to 10%, plus any rate limit at 80% or above. Rounding keeps the prompt cache warm.
- A `/usage` slash command that prints the same report for you.

## Install

```
/plugin install token-usage --marketplace TheAmbitiousCorry/token-usage
```

Answer `y` to add the marketplace, then pick a scope (user scope installs it for every session).

## Output

```
Context: 43,000 / 200,000 tokens (21% used)
Session cost: $1.23
Rate limit five_hour: 83.5% used, resets 2026-10-28T12:00:00Z
```

## Develop

```
claude plugin validate .
claude plugin test .
```

`claude --plugin-dir .` runs a session with the working copy loaded.
