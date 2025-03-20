import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Starting signout process...')
    
    // Create a Supabase client with the route handler context using the updated pattern
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookies() 
    })
    
    // Sign out the user from Supabase - this should clear the session cookie
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error in Supabase signOut:', error)
      throw error
    }
    
    console.log('Supabase signOut successful, now clearing cookies')
    
    // Create response with redirect - use 3000 as fallback to match Next.js default
    const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    
    // Clear important auth cookies explicitly by name with various paths
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      '__session',
      'supabase-cookies-allowed',
      'sb-provider-token',
      'sb-auth-token',
      'sb-refresh',
      'sb-access',
      'sb',
      '__supabase'
    ]
    
    // Clear cookies with various configurations to ensure they're all removed
    cookiesToClear.forEach(name => {
      // Try with default path
      response.cookies.delete(name)
      
      // Try with root path
      response.cookies.delete({
        name,
        path: '/',
      })
      
      // Try with domain and root path
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        try {
          const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
          response.cookies.delete({
            name,
            path: '/',
            domain
          })
        } catch (e) {
          console.error(`Failed to parse domain from ${process.env.NEXT_PUBLIC_SITE_URL}:`, e)
        }
      }
    })
    
    console.log('All cookies cleared, user signed out successfully')
    return response
  } catch (error) {
    console.error('Error signing out:', error)
    return NextResponse.json(
      { error: 'An error occurred while signing out' },
      { status: 500 }
    )
  }
} 