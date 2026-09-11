import { createHash, timingSafeEqual } from 'node:crypto'

export function sha256(content: Uint8Array) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashesMatch(left: string, right: string) {
  const a = Buffer.from(left.trim().toLowerCase(), 'utf8')
  const b = Buffer.from(right.trim().toLowerCase(), 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}
