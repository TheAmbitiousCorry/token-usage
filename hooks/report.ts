import type { SessionUsage } from 'claude-code'

const fmt = (n: number) => n.toLocaleString('en-US')

export const report = (u: SessionUsage): string => {
  const { context, rateLimits, cost } = u
  const lines = [
    `Context: ${fmt(context.tokens ?? 0)} / ${fmt(context.window)} tokens (${context.percent ?? 0}% used)`,
  ]
  if (cost) lines.push(`Session cost: $${cost.usd.toFixed(2)}`)
  for (const r of rateLimits) {
    const reset = r.resetsAt ? `, resets ${r.resetsAt}` : ''
    lines.push(`Rate limit ${r.kind}: ${r.percentUsed}% used${reset}`)
  }
  return lines.join('\n')
}

// Rounded to 10% so the system prompt section changes rarely and keeps its cache.
export const promptLine = (u: SessionUsage): string => {
  const pct = Math.floor((u.context.percent ?? 0) / 10) * 10
  const tight = u.rateLimits.filter(r => r.percentUsed >= 80).map(r => `${r.kind} ${Math.floor(r.percentUsed)}%`)
  const limits = tight.length ? ` Rate limits near cap: ${tight.join(', ')}.` : ''
  return `Context window about ${pct}% used of ${fmt(u.context.window)} tokens.${limits}`
}
