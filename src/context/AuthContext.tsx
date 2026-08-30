import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface AdminProfile {
  id: string
  email: string
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  isAdmin: boolean
  adminProfile: AdminProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function checkAdmin(userId: string) {
    setLoading(true)
    const { data } = await supabase
      .from('admins')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle()

    setAdminProfile(data as AdminProfile | null)
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session)
      if (data.session) {
        checkAdmin(data.session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, sess: Session | null) => {
      setSession(sess)
      if (sess) {
        checkAdmin(sess.user.id)
      } else {
        setAdminProfile(null)
        setLoading(false)
      }
    })

    return () => { listener.subscription.unsubscribe() }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setAdminProfile(null)
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isAdmin: !!adminProfile,
    adminProfile,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
