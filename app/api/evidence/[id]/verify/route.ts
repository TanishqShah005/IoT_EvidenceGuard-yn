import { NextResponse } from 'next/server'
import { verifyEvidence } from '@/lib/evidence/verification'

export const runtime = 'nodejs'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return NextResponse.json({ verification: await verifyEvidence(id) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify evidence'
    return NextResponse.json({ error: message }, { status: message.includes('not found') ? 404 : 422 })
  }
}
