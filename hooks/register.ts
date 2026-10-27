import type { Register } from 'claude-code'

import { promptLine, report } from './report'

const TOOL = 'mcp__token-usage__usage'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'usage',
      description:
        'Current token usage of this Claude Code session: context window fill, cost so far, and rate-limit windows. Call it before deciding how much context to spend, or when asked about token usage.',
      inputSchema: { type: 'object', properties: {} },
      isDeferred: false,
    })
    await $.command.register({ name: 'usage', description: 'Show token usage, cost and rate limits' })
    return next(e)
  })

  on('tool.call', { tool: TOOL }, async $ => {
    return { result: report(await $.session.usage()) }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `${$.plugin.name}: could not read session usage.` }))

  on('command.run', { command: 'usage' }, async $ => ({ text: report(await $.session.usage()) }))

  on('prompt.compose', async ($, e, next) => {
    const { sections } = await next(e)
    const text = `${promptLine(await $.session.usage())} The usage tool (mcp__token-usage__usage) gives the exact figures.`
    return { sections: [...sections, { id: 'token-usage:current', text, scope: 'session' }] }
  })
}
