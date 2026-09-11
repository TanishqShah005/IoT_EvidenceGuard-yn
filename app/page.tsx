'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EvidenceLog } from '@/lib/evidence/types'
import { useFirebaseAuth } from '@/components/firebase-auth-provider'
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  Trash2,
  Upload,
  FileJson,
  Filter,
  LayoutDashboard,
  Menu,
  Monitor,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-react'

type DashboardLog = EvidenceLog & { message?: string }

const demoLogs: DashboardLog[] = [
  { id: '1057', timestamp: '2025-05-20 14:35:22.456Z', deviceId: 'ESP32-001', eventType: 'LOGIN_SUCCESS', sourceIp: '192.168.1.25', level: 'INFO', status: 'VERIFIED', objectKey: 'demo/1057.json', storedHash: '5e2b...e1f', message: 'User admin logged in successfully' },
  { id: '1056', timestamp: '2025-05-20 14:35:21.112Z', deviceId: 'ESP32-001', eventType: 'FILE_READ', sourceIp: '192.168.1.25', level: 'INFO', status: 'VERIFIED', objectKey: 'demo/1056.json', storedHash: '5e2b...e20', message: 'Evidence file accessed for review' },
  { id: '1055', timestamp: '2025-05-20 14:35:20.012Z', deviceId: 'ESP32-001', eventType: 'LOGIN_ATTEMPT', sourceIp: '192.168.1.25', level: 'WARN', status: 'VERIFIED', objectKey: 'demo/1055.json', storedHash: '5e2b...e21', message: 'Login attempt recorded and verified' },
  { id: '1054', timestamp: '2025-05-20 14:35:18.975Z', deviceId: 'ESP32-001', eventType: 'FILE_DELETE', sourceIp: '192.168.1.25', level: 'WARN', status: 'TAMPERED', objectKey: 'demo/1054.json', storedHash: '5e2b...e22', message: 'File deletion failed hash verification' },
  { id: '1053', timestamp: '2025-05-20 14:35:17.654Z', deviceId: 'ESP32-001', eventType: 'CONFIG_CHANGE', sourceIp: '192.168.1.25', level: 'INFO', status: 'VERIFIED', objectKey: 'demo/1053.json', storedHash: '5e2b...e23', message: 'Device configuration updated' },
]

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Evidence Timeline', href: '/evidence-timeline', icon: SlidersHorizontal },
  { label: 'Hash Verification', href: '/hash-verification', icon: ShieldCheck },
  { label: 'Devices', href: '/devices', icon: Monitor },
  { label: 'Alerts & Tamper', href: '/alerts-tamper', icon: AlertTriangle },
  { label: 'Reports', href: '/reports', icon: FileJson },
  { label: 'Threat Intelligence', href: '/threat-intelligence', icon: CircleHelp },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Users & Roles', href: '/users-roles', icon: UserRound },
  { label: 'Audit Logs', href: '/audit-logs', icon: ClipboardCheck },
]

function StatCard({ icon: Icon, label, value, detail, tone }: { icon: typeof Monitor; label: string; value: string; detail: string; tone: 'blue' | 'green' | 'red' }) {
  return <div className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon /></div>
    <div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div>
  </div>
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'success' | 'danger' | 'info' | 'warn' }) {
  return <span className={`badge ${tone}`}>{tone === 'success' ? '✓' : tone === 'danger' ? '△' : ''}{children}</span>
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Unable to load evidence logs')
  return response.json() as Promise<{ logs: DashboardLog[] }>
}

export default function Page() {
  const router = useRouter()
  const { user, loading: authLoading, configured, isInvestigator } = useFirebaseAuth()
  const { data, error, isLoading, mutate } = useSWR('/api/evidence', fetcher, { refreshInterval: 15000, revalidateOnFocus: false })
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [device, setDevice] = useState('All Devices')
  const [level, setLevel] = useState('All Levels')
  const [selected, setSelected] = useState<DashboardLog>(demoLogs[0])
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [showJson, setShowJson] = useState(true)
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (!authLoading && (!configured || !user || !isInvestigator)) router.replace('/login') }, [authLoading, configured, isInvestigator, router, user])
  if (authLoading || !configured || !user || !isInvestigator) return <main className="auth-page"><div className="auth-card"><p className="eyebrow">EVIDENCEGUARD / SECURE ACCESS</p><h1>Checking investigator access</h1><p className="subheading">Verifying your Firebase session and investigator permissions.</p></div></main>
  const authHeaders = async () => user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {}

  const announce = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `evidenceguard-logs-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    announce(`${filteredLogs.length} log${filteredLogs.length === 1 ? '' : 's'} exported.`)
  }

  const importLogs = async (file: File) => {
    setImporting(true)
    try {
      const payload = JSON.parse(await file.text())
      const response = await fetch('/api/evidence/import', { method: 'POST', headers: { 'content-type': 'application/json', ...(await authHeaders()) }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Import failed')
      await mutate()
      announce(`${result.imported} log${result.imported === 1 ? '' : 's'} imported.`)
    } catch (importError) {
      announce(importError instanceof Error ? importError.message : 'Unable to import logs.')
    } finally {
      setImporting(false)
    }
  }

  const deleteSelectedLog = async () => {
    if (!activeSelected || !window.confirm(`Delete log #${activeSelected.id}?`)) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/evidence/${activeSelected.id}`, { method: 'DELETE', headers: await authHeaders() })
      if (!response.ok) throw new Error('Unable to delete log')
      await mutate()
      setSelected(demoLogs[0])
      announce(`Log #${activeSelected.id} deleted.`)
    } catch (deleteError) {
      announce(deleteError instanceof Error ? deleteError.message : 'Unable to delete log.')
    } finally {
      setDeleting(false)
    }
  }

  const logs = data?.logs?.length ? data.logs : demoLogs
  const activeSelected = logs.find((log) => log.id === selected.id) ?? logs[0]
  const filteredLogs = useMemo(() => logs.filter((log) => {
    const matchesQuery = [log.id, log.deviceId, log.eventType, log.sourceIp].some((field) => field.toLowerCase().includes(query.toLowerCase()))
    return matchesQuery && (device === 'All Devices' || log.deviceId === device) && (level === 'All Levels' || log.level === level)
  }), [logs, query, device, level])

  return <main className="app-shell">{notice && <div className="action-notice" role="status">{notice}</div>}
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><ShieldCheck /></div><div><strong>EvidenceGuard</strong><span>Digital Forensics</span></div></div>
      <button className="menu-button" aria-label="Toggle navigation" onClick={() => setMobileOpen(!mobileOpen)}><Menu /></button>
      <div className="search-box"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search logs, devices, IPs, users..." /><kbd>⌘ K</kbd></div>
      <div className="top-actions"><button aria-label="Notifications" className="icon-button" onClick={() => announce('You have 3 unread tamper alerts.')}><Bell /><i>3</i></button><button aria-label="Help" className="icon-button" onClick={() => announce('Workspace guide opened. Review the sidebar to explore EvidenceGuard.')}><CircleHelp /></button><div className="profile-wrap"><button className="profile" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}><div className="avatar">IN</div><span>Investigator</span><ChevronDown /></button>{profileOpen && <div className="profile-menu"><button onClick={() => announce('Profile settings selected.')}>Profile settings</button><button onClick={() => announce('Signed-in session is active.')}>Session status</button></div>}</div></div>
    </header>
    <div className="body-layout">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <nav>{navItems.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className={label === 'Dashboard' ? 'active' : ''} title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)}><Icon /><span>{label}</span></Link>)}</nav>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight /> : <ChevronLeft />}<span>{collapsed ? 'Expand' : 'Collapse'}</span></button>
      </aside>
      <section className="content">
        <div className="page-heading"><div><p className="eyebrow">FORENSIC OPERATIONS / LIVE VIEW</p><h1>Investigator Dashboard</h1><p className="subheading">Monitor evidence integrity and review device activity in real time.</p><p className={`data-sync ${error ? 'error' : ''}`}>{isLoading ? 'Syncing evidence records...' : error ? 'API unavailable · showing demo records' : data?.logs?.length ? `Live API · ${data.logs.length} records loaded` : 'API connected · awaiting evidence records'}</p></div><div className="heading-actions"><span className="live-dot"><i /> System live</span><label className={`outline-button import-button ${importing ? 'disabled' : ''}`}><Upload /> {importing ? 'Importing...' : 'Import logs'}<input type="file" accept="application/json,.json" disabled={importing} onChange={(event) => { const file = event.target.files?.[0]; if (file) void importLogs(file); event.currentTarget.value = '' }} /></label><button className="outline-button" onClick={exportLogs}><Download /> Export logs</button><button className="outline-button danger-outline" onClick={deleteSelectedLog} disabled={deleting}><Trash2 /> {deleting ? 'Deleting...' : 'Delete log'}</button></div></div>
        <div className="stats-grid"><StatCard icon={Monitor} label="Total Devices" value="12" detail="Online: 9  ·  Offline: 3" tone="blue" /><StatCard icon={FileCheck2} label="Total Logs" value="24,851" detail="Today: 1,542" tone="green" /><StatCard icon={AlertTriangle} label="Tamper Alerts" value="7" detail="Critical: 2  ·  High: 5" tone="red" /><StatCard icon={ShieldCheck} label="Integrity OK" value="99.62%" detail="Verified Logs" tone="green" /></div>
        <div className="dashboard-grid">
          <div className="main-column">
            <section className="panel timeline-panel">
              <div className="panel-header"><div className="panel-title"><div className="title-icon"><Clock3 /></div><div><h2>Evidence Timeline</h2><p>Chronological device activity and verification events</p></div></div><div className="panel-actions"><button className="date-button" onClick={() => announce('Date range selector is ready for a connected date filter.')} aria-label="Select date range">May 20, 2025 <span>→</span> May 20, 2025 <ChevronDown /></button><button className="outline-button small" onClick={() => setShowFilters(!showFilters)}><Filter /> Filters</button><button className="outline-button small" onClick={exportLogs}><Download /> Export logs</button></div></div>
              {showFilters && <div className="inline-filter"><span>Quick filters</span><button onClick={() => { setDevice('All Devices'); setLevel('All Levels'); setQuery('') }}>Clear all</button></div>}
              <div className="table-wrap"><table><thead><tr><th>#</th><th>Timestamp (UTC)</th><th>Device ID</th><th>Event Type</th><th>Source IP</th><th>Level</th><th>Status</th></tr></thead><tbody>{filteredLogs.map((log) => <tr key={log.id} className={activeSelected.id === log.id ? 'selected' : ''} onClick={() => setSelected(log)}><td>{log.id}</td><td>{log.timestamp}</td><td>{log.deviceId}</td><td><span className="event-name">{log.eventType}</span></td><td>{log.sourceIp}</td><td><Badge tone={log.level === 'INFO' ? 'info' : 'warn'}>{log.level}</Badge></td><td><Badge tone={log.status === 'VERIFIED' ? 'success' : 'danger'}>{log.status === 'VERIFIED' ? 'Verified' : 'Tampered'}</Badge></td></tr>)}</tbody></table></div>
              <div className="table-footer"><span>Showing {filteredLogs.length ? 1 : 0} to {filteredLogs.length} of 24,851 entries</span><div className="pagination"><button><ChevronsLeft /></button><button><ChevronLeft /></button>{[1, 2, 3, 4, 5].map((n) => <button key={n} className={page === n ? 'current' : ''} onClick={() => setPage(n)}>{n}</button>)}<button><ChevronRight /></button><button><ChevronsRight /></button></div></div>
            </section>
            <section className="panel details-panel"><div className="details-title"><h2>Log Entry Details</h2><span>Selected log #{activeSelected.id}</span></div><div className="detail-columns"><div className="detail-list">{[['Log ID', activeSelected.id], ['Device ID', activeSelected.deviceId], ['Timestamp', activeSelected.timestamp], ['Event Type', activeSelected.eventType], ['Source IP', activeSelected.sourceIp], ['User', 'admin'], ['Message', activeSelected.message ?? 'Evidence log imported from storage'], ['Log Sequence', activeSelected.id], ['Log Size (bytes)', '256']].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="hash-check"><h3>Hash Chain Verification</h3><div><span>Previous Hash</span><code>8c1a...d4e</code></div><div><span>Current Hash (Stored)</span><code>5e2b...e1f</code></div><div><span>Current Hash (Computed)</span><code>5e2b...e1f</code></div><div><span>Match Status</span><Badge tone="success"> MATCH</Badge></div><div><span>Integrity</span><strong className="verified"><ShieldCheck /> Verified</strong></div><div><span>Algorithm</span><strong>SHA-256</strong></div></div>{showJson && <div className="json-view"><h3>Raw Log (JSON) <button aria-label="Close JSON view" onClick={() => setShowJson(false)}><X /></button></h3><pre>{JSON.stringify({ log_id: activeSelected.id, device_id: activeSelected.deviceId, timestamp: activeSelected.timestamp, event_type: activeSelected.eventType, event_level: activeSelected.level, source_ip: activeSelected.sourceIp, user: 'admin', message: activeSelected.message ?? 'Evidence log imported from storage' }, null, 2)}</pre></div>}</div></section>
          </div>
          <aside className="right-rail"><section className="panel filter-panel"><div className="side-title"><h2>Filters</h2><SlidersHorizontal /></div><label>Device ID<select value={device} onChange={(e) => setDevice(e.target.value)}><option>All Devices</option><option>ESP32-001</option></select></label><label>Event Type<select><option>All Events</option><option>LOGIN_SUCCESS</option><option>FILE_DELETE</option></select></label><label>Level<select value={level} onChange={(e) => setLevel(e.target.value)}><option>All Levels</option><option>INFO</option><option>WARN</option></select></label><div className="date-range"><span>2025-05-20</span><b>→</b><span>2025-05-20</span></div><div className="filter-buttons"><button className="primary-button" onClick={() => announce(`Filters applied${device !== 'All Devices' || level !== 'All Levels' ? ` for ${device !== 'All Devices' ? device : level}` : ''}.`)}>Apply Filters</button><button className="outline-button" onClick={() => { setDevice('All Devices'); setLevel('All Levels'); setQuery(''); announce('Filters reset.') }}>Reset</button></div></section><section className="panel device-panel"><div className="side-title"><h2>Device Information</h2><Monitor /></div><div className="device-name"><span className="online-status" /> ESP32-001</div><dl><div><dt>Status</dt><dd className="verified">● Online</dd></div><div><dt>IP Address</dt><dd>192.168.1.10</dd></div><div><dt>Location</dt><dd>Lab - Rack 1</dd></div><div><dt>Last Seen</dt><dd>2025-05-20 14:35:30Z</dd></div></dl><Link className="outline-button full" href={`/devices?device=${encodeURIComponent(activeSelected.deviceId)}`}>View Details</Link></section><section className="panel alerts-panel"><div className="side-title"><h2>Tamper Alerts <span>(7)</span></h2><AlertTriangle /></div><ul><li><i className="critical" />FILE_DELETE detected <time>14:35:18</time></li><li><i />Log chain mismatch <time>14:20:11</time></li><li><i />Multiple failed logins <time>13:55:02</time></li></ul><Link className="outline-button full" href="/alerts-tamper">View All Alerts</Link></section></aside>
        </div>
      </section>
    </div>
    <footer><span>EvidenceGuard v1.0.0</span><span>© 2025 EvidenceGuard Project. All rights reserved.</span><span><Clock3 /> Session Timeout: 29:45</span></footer>
  </main>
}
