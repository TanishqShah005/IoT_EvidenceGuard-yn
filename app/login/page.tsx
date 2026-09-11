'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/components/firebase-auth-provider'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, configured, user, loading } = useFirebaseAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (user) router.replace('/')
  }, [router, user])

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try { await signIn(email, password); router.replace('/') } catch (authError) { setError(authError instanceof Error ? authError.message : 'Unable to sign in. Check the Firebase credentials and investigator role.') } finally { setBusy(false) }
  }
  if (loading) return <main className="auth-page"><div className="auth-card"><h1>Checking secure access...</h1><p className="subheading">Verifying your Firebase session.</p></div></main>
  if (user) return <main className="auth-page"><div className="auth-card"><h1>Opening dashboard...</h1><p className="subheading">Your investigator session is active.</p></div></main>
  return <main className="auth-page"><form className="auth-card" onSubmit={submit}><p className="eyebrow">EVIDENCEGUARD / SECURE ACCESS</p><h1>Investigator login</h1><p className="subheading">Sign in with an authorized Firebase investigator account.</p>{!configured && <div className="auth-warning">Firebase is not configured yet. Add the Firebase web variables before signing in.</div>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="primary-button" disabled={busy || !configured}>{busy ? 'Signing in...' : 'Sign in'}</button></form></main>
}
