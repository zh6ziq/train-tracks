// Cloud copy of a player's progress, keyed by their sync code.
// GET returns what's stored; PUT merges the sent progress into it and returns the result,
// so two devices sharing a code never overwrite each other.
import { Redis } from '@upstash/redis'
import { merge } from '../src/game/merge.js'

const CODE = /^[0-9A-HJKMNP-TV-Z]{12}$/
const MAX_BYTES = 64 * 1024

// The Vercel Upstash integration may name its variables either way.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
})

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const code = String(req.headers['x-sync-code'] || '')
  if (!CODE.test(code)) return res.status(400).json({ error: 'bad code' })
  const key = `progress:${code}`

  if (req.method === 'GET') {
    return res.status(200).json({ data: (await redis.get(key)) || null })
  }

  if (req.method === 'PUT') {
    let body = req.body
    try {
      if (typeof body === 'string') body = JSON.parse(body)
    } catch {
      body = null
    }
    if (!body || typeof body !== 'object' || JSON.stringify(body).length > MAX_BYTES) {
      return res.status(400).json({ error: 'bad body' })
    }
    const merged = merge((await redis.get(key)) || {}, body)
    await redis.set(key, merged)
    return res.status(200).json({ data: merged })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).end()
}
