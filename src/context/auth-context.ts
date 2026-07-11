import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface AdminProfile {
  id: string
  email: string
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  isAdmin: boolean
  adminProfile: AdminProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
