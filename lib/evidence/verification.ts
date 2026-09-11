import { sha256, hashesMatch } from './hash'
import { evidenceRepository, evidenceStorage } from './store'
import type { VerificationResult } from './types'

export async function verifyEvidence(logId: string): Promise<VerificationResult> {
  const log = await evidenceRepository.getLog(logId)
  if (!log) throw new Error('Evidence log was not found')

  const object = await evidenceStorage.getObject(log.objectKey)
  const storedHash = await evidenceStorage.getHash(log.objectKey)
  if (!object || !storedHash) throw new Error('Evidence object or stored hash was not found')

  const calculatedHash = sha256(object)
  const result: VerificationResult = {
    logId,
    objectKey: log.objectKey,
    storedHash,
    calculatedHash,
    status: hashesMatch(calculatedHash, storedHash) ? 'VERIFIED' : 'TAMPERED',
    verifiedAt: new Date().toISOString(),
  }

  await evidenceRepository.updateVerification(logId, result)
  await evidenceRepository.saveVerification({
    id: crypto.randomUUID(),
    type: 'VERIFICATION',
    logId,
    status: result.status,
    calculatedHash,
    storedHash,
    createdAt: result.verifiedAt,
  })
  return result
}
