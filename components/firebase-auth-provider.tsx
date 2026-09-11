'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { firebaseAuth, firebaseConfigured } from '@/lib/firebase/client'

type AuthContextValue = { user: User | null; loading: boolean; configured: boolean; signIn: (email: string, password: string) => Promise<User>; signOutUser: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { if (!firebaseAuth) { setLoading(false); return } return onAuthStateChanged(firebaseAuth, (nextUser) => { setUser(nextUser); setLoading(false) }) }, [])
  const value = useMemo<AuthContextValue>(() => ({ user, loading, configured: firebaseConfigured, signIn: async (email, password) => { if (!firebaseAuth) throw new Error('Firebase is not configured'); return (await signInWithEmailAndPassword(firebaseAuth, email, password)).user }, signOutUser: () => firebaseAuth ? signOut(firebaseAuth) : Promise.resolve() }), [loading, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider')
  return context
}
