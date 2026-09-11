import type { EvidenceLog, EvidenceRepository, EvidenceStorage, VerificationRecord, VerificationResult } from './types'

const objects = new Map<string, Uint8Array>()
const hashes = new Map<string, string>()
const logs = new Map<string, EvidenceLog>()
const verifications: VerificationRecord[] = []

function toBytes(content: string | Uint8Array) {
  return typeof content === 'string' ? new TextEncoder().encode(content) : content
}

export const evidenceStorage: EvidenceStorage = {
  async putObject(objectKey, content) {
    objects.set(objectKey, toBytes(content))
  },
  async getObject(objectKey) {
    return objects.get(objectKey) ?? null
  },
  async putHash(objectKey, sha256) {
    hashes.set(objectKey, sha256)
  },
  async getHash(objectKey) {
    return hashes.get(objectKey) ?? null
  },
}

export const evidenceRepository: EvidenceRepository & { saveVerification(record: VerificationRecord): Promise<void> } = {
  async saveLog(log) {
    logs.set(log.id, log)
    return log
  },
  async getLog(id) {
    return logs.get(id) ?? null
  },
  async updateVerification(id, result: VerificationResult) {
    const current = logs.get(id)
    if (!current) return null
    const updated = { ...current, calculatedHash: result.calculatedHash, status: result.status, verifiedAt: result.verifiedAt }
    logs.set(id, updated)
    return updated
  },
  async listLogs() {
    return [...logs.values()].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  },
  async saveVerification(record) {
    verifications.push(record)
  },
}

export function getVerificationRecords() {
  return [...verifications]
}
