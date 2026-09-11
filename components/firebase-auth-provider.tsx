'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getIdTokenResult, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { firebaseAuth, firebaseConfigured } from '@/lib/firebase/client'

type AuthContextValue = { user: User | null; loading: boolean; configured: boolean; isInvestigator: boolean; signIn: (email: string, password: string) => Promise<User>; signOutUser: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInvestigator, setIsInvestigator] = useState(false)
  useEffect(() => { if (!firebaseAuth) { setLoading(false); return } return onAuthStateChanged(firebaseAuth, async (nextUser) => { setUser(nextUser); if (nextUser) { const token = await getIdTokenResult(nextUser); setIsInvestigator(token.claims.investigator === true || token.claims.role === 'investigator') } else setIsInvestigator(false); setLoading(false) }) }, [])
  const value = useMemo<AuthContextValue>(() => ({ user, loading, configured: firebaseConfigured, isInvestigator, signIn: async (email, password) => { if (!firebaseAuth) throw new Error('Firebase is not configured'); const signedInUser = (await signInWithEmailAndPassword(firebaseAuth, email, password)).user; const token = await getIdTokenResult(signedInUser, true); if (token.claims.investigator !== true && token.claims.role !== 'investigator') { await signOut(firebaseAuth); throw new Error('Investigator access is required') } setIsInvestigator(true); return signedInUser }, signOutUser: () => firebaseAuth ? signOut(firebaseAuth) : Promise.resolve() }), [isInvestigator, loading, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider')
  return context
}
