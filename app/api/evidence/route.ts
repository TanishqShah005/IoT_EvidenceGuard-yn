import { NextResponse } from 'next/server'
import { evidenceRepository } from '@/lib/evidence/store'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ logs: await evidenceRepository.listLogs() })
}
