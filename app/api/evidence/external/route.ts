import { NextResponse } from 'next/server'
import { evidenceRepository, evidenceStorage } from '@/lib/evidence/store'
import type { EvidenceLog } from '@/lib/evidence/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<EvidenceLog> & { content?: string; storedHash?: string }
    if (!body.content || !body.objectKey || !body.deviceId || !body.eventType || !body.storedHash) {
      return NextResponse.json({ error: 'content, objectKey, deviceId, eventType, and storedHash are required' }, { status: 400 })
    }
    const bytes = new TextEncoder().encode(body.content)
    await evidenceStorage.putObject(body.objectKey, bytes)
    await evidenceStorage.putHash(body.objectKey, body.storedHash)
    const log: EvidenceLog = {
      id: body.id ?? crypto.randomUUID(),
      deviceId: body.deviceId,
      eventType: body.eventType,
      sourceIp: body.sourceIp ?? 'unknown',
      level: body.level ?? 'INFO',
      timestamp: body.timestamp ?? new Date().toISOString(),
      objectKey: body.objectKey,
      storedHash: body.storedHash,
      status: 'VERIFIED',
    }
    await evidenceRepository.saveLog(log)
    return NextResponse.json({ log }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to ingest external evidence' }, { status: 400 })
  }
}
