export type VerificationStatus = 'VERIFIED' | 'TAMPERED'
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'

export interface EvidenceLog {
  id: string
  deviceId: string
  eventType: string
  sourceIp: string
  level: LogLevel
  timestamp: string
  objectKey: string
  storedHash: string
  calculatedHash?: string
  status: VerificationStatus
  verifiedAt?: string
}

export interface VerificationResult {
  logId: string
  objectKey: string
  storedHash: string
  calculatedHash: string
  status: VerificationStatus
  verifiedAt: string
}

export interface EvidenceStorage {
  putObject(objectKey: string, content: string | Uint8Array): Promise<void>
  getObject(objectKey: string): Promise<Uint8Array | null>
  putHash(objectKey: string, sha256: string): Promise<void>
  getHash(objectKey: string): Promise<string | null>
}

export interface EvidenceRepository {
  saveLog(log: EvidenceLog): Promise<EvidenceLog>
  getLog(id: string): Promise<EvidenceLog | null>
  updateVerification(id: string, result: VerificationResult): Promise<EvidenceLog | null>
  listLogs(): Promise<EvidenceLog[]>
  deleteLog(id: string): Promise<boolean>
}

export interface VerificationRecord {
  id: string
  type: 'VERIFICATION'
  logId: string
  status: VerificationStatus
  calculatedHash: string
  storedHash: string
  createdAt: string
}
