import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain: string; sameSite: 'lax' | 'strict' | 'none'; secure: boolean }) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // This can happen in middleware or other server contexts
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: { path: string }) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // This can happen in middleware or other server contexts
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )
} 