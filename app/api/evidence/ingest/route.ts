import { NextResponse } from 'next/server'
import { sha256 } from '@/lib/evidence/hash'
import { evidenceRepository, evidenceStorage } from '@/lib/evidence/store'
import type { EvidenceLog, LogLevel } from '@/lib/evidence/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<EvidenceLog> & { content?: string }
    if (!body.content || !body.objectKey || !body.deviceId || !body.eventType) {
      return NextResponse.json({ error: 'content, objectKey, deviceId, and eventType are required' }, { status: 400 })
    }

    const bytes = new TextEncoder().encode(body.content)
    const storedHash = sha256(bytes)
    await evidenceStorage.putObject(body.objectKey, bytes)
    await evidenceStorage.putHash(body.objectKey, storedHash)

    const log: EvidenceLog = {
      id: body.id ?? crypto.randomUUID(),
      deviceId: body.deviceId,
      eventType: body.eventType,
      sourceIp: body.sourceIp ?? 'unknown',
      level: (body.level ?? 'INFO') as LogLevel,
      timestamp: body.timestamp ?? new Date().toISOString(),
      objectKey: body.objectKey,
      storedHash,
      status: 'VERIFIED',
    }
    await evidenceRepository.saveLog(log)
    return NextResponse.json({ log }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to ingest evidence' }, { status: 400 })
  }
}
