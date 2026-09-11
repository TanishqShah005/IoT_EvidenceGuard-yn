import { NextResponse } from 'next/server'
import { evidenceRepository, evidenceStorage } from '@/lib/evidence/store'
import type { EvidenceLog, LogLevel } from '@/lib/evidence/types'

export const runtime = 'nodejs'

type SourceLog = {
  log_id: string
  device_id: string
  timestamp: string
  event_type: string
  level: string
  source_ip: string
  current_hash: string
  [key: string]: unknown
}

function canonicalContent(log: SourceLog) {
  const { current_hash: _currentHash, previous_hash: _previousHash, ...payload } = log
  return JSON.stringify(payload)
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as SourceLog[] | { logs?: SourceLog[] }
    const logs = Array.isArray(payload) ? payload : payload.logs
    if (!logs?.length) return NextResponse.json({ error: 'A non-empty logs array is required' }, { status: 400 })

    const imported: EvidenceLog[] = []
    for (const source of logs) {
      if (!source.log_id || !source.device_id || !source.timestamp || !source.current_hash) continue
      const objectKey = `external/${source.device_id}/${source.timestamp.replaceAll(':', '-')}-${source.log_id}.json`
      const content = canonicalContent(source)
      await evidenceStorage.putObject(objectKey, content)
      await evidenceStorage.putHash(objectKey, source.current_hash)
      const log: EvidenceLog = {
        id: source.log_id,
        deviceId: source.device_id,
        eventType: source.event_type ?? 'UNKNOWN',
        sourceIp: source.source_ip ?? 'unknown',
        level: ['INFO', 'WARN', 'ERROR', 'CRITICAL'].includes(source.level) ? source.level as LogLevel : 'INFO',
        timestamp: source.timestamp,
        objectKey,
        storedHash: source.current_hash,
        status: 'TAMPERED',
      }
      await evidenceRepository.saveLog(log)
      imported.push(log)
    }

    return NextResponse.json({
      imported: imported.length,
      logs: imported,
      note: 'The supplied current_hash values are treated as stored hashes. Verification requires the exact original cloud object bytes; canonical JSON is only a development fallback.',
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to import logs' }, { status: 400 })
  }
}
