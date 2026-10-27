import { expect, test } from 'claude-code/testing'

import { promptLine, report } from '../hooks/report'

const usage = {
  startedAt: 0,
  context: { tokens: 43_000, window: 200_000, percent: 21 },
  rateLimits: [{ kind: 'five_hour', percentUsed: 83.5, resetsAt: '2026-10-28T12:00:00Z' }],
  cost: { usd: 1.234 },
}

const compose = {
  model: 'claude-fable-5-1', promptModel: 'claude-fable-5-1', surfaces: ['terminal'], tools: [], outputStyle: null, traits: [],
} as const

test('report lists context, cost and rate limits', () => {
  expect(report(usage)).toBe(
    'Context: 43,000 / 200,000 tokens (21% used)\nSession cost: $1.23\nRate limit five_hour: 83.5% used, resets 2026-10-28T12:00:00Z',
  )
})

test('prompt line rounds down to 10% and names limits near cap', () => {
  expect(promptLine(usage)).toBe(
    'Context window about 20% used of 200,000 tokens. Rate limits near cap: five_hour 83%.',
  )
  expect(promptLine({ ...usage, rateLimits: [] })).toBe('Context window about 20% used of 200,000 tokens.')
})

test('the usage tool answers the model with the report', async ($, on) => {
  on('session.usage', () => ({ value: usage }))
  const ran = await $.tool.call({ tool: 'mcp__token-usage__usage' })
  expect(ran.deny).toBeUndefined()
  expect(ran.result).toBe(report(usage))
})

test('the usage tool denies when usage cannot be read', async ($, on) => {
  on('session.usage', () => ({ deny: 'no session' }))
  const ran = await $.tool.call({ tool: 'mcp__token-usage__usage' })
  expect(ran.deny).toContain('could not read session usage')
})

test('the system prompt carries a usage section after the engine sections', async ($, on) => {
  on('session.usage', () => ({ value: usage }))
  on('prompt.compose', () => ({ sections: [{ id: 'intro', text: 'engine', scope: 'shared' as const }] }))
  const { sections } = await $.prompt.compose(compose)
  expect(sections.map(s => s.id)).toEqual(['intro', 'token-usage:current'])
  expect(sections[1]?.scope).toBe('session')
  expect(sections[1]?.text).toContain('Context window about 20% used')
})
