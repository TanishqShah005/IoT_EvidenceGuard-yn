import { NextResponse } from 'next/server'
import { evidenceRepository } from '@/lib/evidence/store'
import { requireInvestigator } from '@/lib/firebase/authorization'

export const runtime = 'nodejs'

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await requireInvestigator(request)
  if (authorization instanceof Response) return authorization
  const { id } = await context.params
  const deleted = await evidenceRepository.deleteLog(id)
  if (!deleted) return NextResponse.json({ error: 'Evidence log not found' }, { status: 404 })
  return NextResponse.json({ deleted: true, id })
}
