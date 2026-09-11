'use client'

import { useMemo, useState } from 'react'
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

const logs = [
  { id: '1057', timestamp: '2025-05-20 14:35:22.456Z', device: 'ESP32-001', event: 'LOGIN_SUCCESS', ip: '192.168.1.25', level: 'INFO', status: 'Verified', message: 'User admin logged in successfully' },
  { id: '1056', timestamp: '2025-05-20 14:35:21.112Z', device: 'ESP32-001', event: 'FILE_READ', ip: '192.168.1.25', level: 'INFO', status: 'Verified', message: 'Evidence file accessed for review' },
  { id: '1055', timestamp: '2025-05-20 14:35:20.012Z', device: 'ESP32-001', event: 'LOGIN_ATTEMPT', ip: '192.168.1.25', level: 'WARN', status: 'Verified', message: 'Login attempt recorded and verified' },
  { id: '1054', timestamp: '2025-05-20 14:35:18.975Z', device: 'ESP32-001', event: 'FILE_DELETE', ip: '192.168.1.25', level: 'WARN', status: 'Tampered', message: 'File deletion failed hash verification' },
  { id: '1053', timestamp: '2025-05-20 14:35:17.654Z', device: 'ESP32-001', event: 'CONFIG_CHANGE', ip: '192.168.1.25', level: 'INFO', status: 'Verified', message: 'Device configuration updated' },
]

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Evidence Timeline', icon: SlidersHorizontal },
  { label: 'Hash Verification', icon: ShieldCheck },
  { label: 'Devices', icon: Monitor },
  { label: 'Alerts & Tamper', icon: AlertTriangle },
  { label: 'Reports', icon: FileJson },
  { label: 'Threat Intelligence', icon: CircleHelp },
  { label: 'Settings', icon: Settings },
  { label: 'Users & Roles', icon: UserRound },
  { label: 'Audit Logs', icon: ClipboardCheck },
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

export default function Page() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [device, setDevice] = useState('All Devices')
  const [level, setLevel] = useState('All Levels')
  const [selected, setSelected] = useState(logs[0])
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const matchesQuery = [log.id, log.device, log.event, log.ip].some((field) => field.toLowerCase().includes(query.toLowerCase()))
    return matchesQuery && (device === 'All Devices' || log.device === device) && (level === 'All Levels' || log.level === level)
  }), [query, device, level])

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><ShieldCheck /></div><div><strong>EvidenceGuard</strong><span>Digital Forensics</span></div></div>
      <button className="menu-button" aria-label="Toggle navigation" onClick={() => setMobileOpen(!mobileOpen)}><Menu /></button>
      <div className="search-box"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search logs, devices, IPs, users..." /><kbd>⌘ K</kbd></div>
      <div className="top-actions"><button aria-label="Notifications" className="icon-button"><Bell /><i>3</i></button><button aria-label="Help" className="icon-button"><CircleHelp /></button><div className="profile"><div className="avatar">IN</div><span>Investigator</span><ChevronDown /></div></div>
    </header>
    <div className="body-layout">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={label === 'Dashboard' ? 'active' : ''} title={collapsed ? label : undefined}><Icon /><span>{label}</span></button>)}</nav>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight /> : <ChevronLeft />}<span>{collapsed ? 'Expand' : 'Collapse'}</span></button>
      </aside>
      <section className="content">
        <div className="page-heading"><div><p className="eyebrow">FORENSIC OPERATIONS / LIVE VIEW</p><h1>Investigator Dashboard</h1><p className="subheading">Monitor evidence integrity and review device activity in real time.</p></div><div className="heading-actions"><span className="live-dot"><i /> System live</span><button className="outline-button"><Download /> Export report</button></div></div>
        <div className="stats-grid"><StatCard icon={Monitor} label="Total Devices" value="12" detail="Online: 9  ·  Offline: 3" tone="blue" /><StatCard icon={FileCheck2} label="Total Logs" value="24,851" detail="Today: 1,542" tone="green" /><StatCard icon={AlertTriangle} label="Tamper Alerts" value="7" detail="Critical: 2  ·  High: 5" tone="red" /><StatCard icon={ShieldCheck} label="Integrity OK" value="99.62%" detail="Verified Logs" tone="green" /></div>
        <div className="dashboard-grid">
          <div className="main-column">
            <section className="panel timeline-panel">
              <div className="panel-header"><div className="panel-title"><div className="title-icon"><Clock3 /></div><div><h2>Evidence Timeline</h2><p>Chronological device activity and verification events</p></div></div><div className="panel-actions"><button className="date-button">May 20, 2025 <span>→</span> May 20, 2025 <ChevronDown /></button><button className="outline-button small" onClick={() => setShowFilters(!showFilters)}><Filter /> Filters</button><button className="outline-button small"><Download /> Export</button></div></div>
              {showFilters && <div className="inline-filter"><span>Quick filters</span><button onClick={() => { setDevice('All Devices'); setLevel('All Levels'); setQuery('') }}>Clear all</button></div>}
              <div className="table-wrap"><table><thead><tr><th>#</th><th>Timestamp (UTC)</th><th>Device ID</th><th>Event Type</th><th>Source IP</th><th>Level</th><th>Status</th></tr></thead><tbody>{filteredLogs.map((log) => <tr key={log.id} className={selected.id === log.id ? 'selected' : ''} onClick={() => setSelected(log)}><td>{log.id}</td><td>{log.timestamp}</td><td>{log.device}</td><td><span className="event-name">{log.event}</span></td><td>{log.ip}</td><td><Badge tone={log.level === 'INFO' ? 'info' : 'warn'}>{log.level}</Badge></td><td><Badge tone={log.status === 'Verified' ? 'success' : 'danger'}>{log.status}</Badge></td></tr>)}</tbody></table></div>
              <div className="table-footer"><span>Showing {filteredLogs.length ? 1 : 0} to {filteredLogs.length} of 24,851 entries</span><div className="pagination"><button><ChevronsLeft /></button><button><ChevronLeft /></button>{[1, 2, 3, 4, 5].map((n) => <button key={n} className={page === n ? 'current' : ''} onClick={() => setPage(n)}>{n}</button>)}<button><ChevronRight /></button><button><ChevronsRight /></button></div></div>
            </section>
            <section className="panel details-panel"><div className="details-title"><h2>Log Entry Details</h2><span>Selected log #{selected.id}</span></div><div className="detail-columns"><div className="detail-list">{[['Log ID', selected.id], ['Device ID', selected.device], ['Timestamp', selected.timestamp], ['Event Type', selected.event], ['Source IP', selected.ip], ['User', 'admin'], ['Message', selected.message], ['Log Sequence', selected.id], ['Log Size (bytes)', '256']].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="hash-check"><h3>Hash Chain Verification</h3><div><span>Previous Hash</span><code>8c1a...d4e</code></div><div><span>Current Hash (Stored)</span><code>5e2b...e1f</code></div><div><span>Current Hash (Computed)</span><code>5e2b...e1f</code></div><div><span>Match Status</span><Badge tone="success"> MATCH</Badge></div><div><span>Integrity</span><strong className="verified"><ShieldCheck /> Verified</strong></div><div><span>Algorithm</span><strong>SHA-256</strong></div></div><div className="json-view"><h3>Raw Log (JSON) <button aria-label="Close JSON view"><X /></button></h3><pre>{JSON.stringify({ log_id: selected.id, device_id: selected.device, timestamp: selected.timestamp, event_type: selected.event, event_level: selected.level, source_ip: selected.ip, user: 'admin', message: selected.message }, null, 2)}</pre></div></div></section>
          </div>
          <aside className="right-rail"><section className="panel filter-panel"><div className="side-title"><h2>Filters</h2><SlidersHorizontal /></div><label>Device ID<select value={device} onChange={(e) => setDevice(e.target.value)}><option>All Devices</option><option>ESP32-001</option></select></label><label>Event Type<select><option>All Events</option><option>LOGIN_SUCCESS</option><option>FILE_DELETE</option></select></label><label>Level<select value={level} onChange={(e) => setLevel(e.target.value)}><option>All Levels</option><option>INFO</option><option>WARN</option></select></label><div className="date-range"><span>2025-05-20</span><b>→</b><span>2025-05-20</span></div><div className="filter-buttons"><button className="primary-button">Apply Filters</button><button className="outline-button">Reset</button></div></section><section className="panel device-panel"><div className="side-title"><h2>Device Information</h2><Monitor /></div><div className="device-name"><span className="online-status" /> ESP32-001</div><dl><div><dt>Status</dt><dd className="verified">● Online</dd></div><div><dt>IP Address</dt><dd>192.168.1.10</dd></div><div><dt>Location</dt><dd>Lab - Rack 1</dd></div><div><dt>Last Seen</dt><dd>2025-05-20 14:35:30Z</dd></div></dl><button className="outline-button full">View Details</button></section><section className="panel alerts-panel"><div className="side-title"><h2>Tamper Alerts <span>(7)</span></h2><AlertTriangle /></div><ul><li><i className="critical" />FILE_DELETE detected <time>14:35:18</time></li><li><i />Log chain mismatch <time>14:20:11</time></li><li><i />Multiple failed logins <time>13:55:02</time></li></ul><button className="outline-button full">View All Alerts</button></section></aside>
        </div>
      </section>
    </div>
    <footer><span>EvidenceGuard v1.0.0</span><span>© 2025 EvidenceGuard Project. All rights reserved.</span><span><Clock3 /> Session Timeout: 29:45</span></footer>
  </main>
}
