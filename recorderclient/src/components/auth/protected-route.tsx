"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 animated-gradient">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-3xl blob1"></div>
          <div className="absolute top-1/4 -left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl blob2"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl blob3"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl blob4"></div>
        </div>
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 