import { NextResponse } from 'next/server'
import { getFirebaseAdminAuth } from './admin'

export async function requireInvestigator(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Investigator authentication required' }, { status: 401 })
  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(token)
    if (decoded.investigator !== true && decoded.role !== 'investigator') {
      return NextResponse.json({ error: 'Investigator role required' }, { status: 403 })
    }
    return decoded
  } catch {
    return NextResponse.json({ error: 'Invalid investigator session' }, { status: 401 })
  }
}
