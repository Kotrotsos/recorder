import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  console.log('=== AUTH STATUS API CALLED ===');
  
  try {
    // Log cookie presence for debugging
    console.log('Checking for auth cookies...');
    const cookieHeader = req.headers.get('cookie') || '';
    
    // Log the first 100 characters of the cookie header for debugging (without showing full tokens)
    const cookiePreview = cookieHeader.substring(0, 100) + (cookieHeader.length > 100 ? '...' : '');
    console.log('Cookie header preview:', cookiePreview);
    
    // Check for different possible Supabase cookie formats
    const hasSbAuthCookie = cookieHeader.includes('sb-auth-token');
    const hasSupabaseCookie = cookieHeader.includes('supabase-auth-token');
    const hasSbProjectCookie = cookieHeader.includes('sb-');
    
    console.log('Cookie header contains auth tokens:', {
      'sb-auth-token': hasSbAuthCookie,
      'supabase-auth-token': hasSupabaseCookie,
      'sb-project-specific': hasSbProjectCookie
    });
    
    // Log all cookies for debugging (with values masked)
    const cookies = cookieHeader.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return {
        name,
        // Mask the value if it's longer than 10 characters
        value: value && value.length > 10 
          ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}`
          : value
      };
    });
    console.log('All cookies (values masked):', cookies);
    
    // Extract auth token from cookie header with improved detection
    const authToken = extractAuthToken(cookieHeader);
    
    if (!authToken) {
      console.log('No auth token found in cookies');
      return NextResponse.json({
        authenticated: false,
        message: 'No auth token found in cookies',
        cookies: cookies
      });
    }
    
    console.log('Auth token found, setting session...');
    
    // Set the auth token for this request
    try {
      await supabase.auth.setSession({
        access_token: authToken,
        refresh_token: '',
      });
      console.log('Session set successfully');
    } catch (sessionError) {
      console.error('Error setting session:', sessionError);
      return NextResponse.json({
        authenticated: false,
        message: 'Error setting session with token',
        error: sessionError,
        cookies: cookies
      });
    }
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return NextResponse.json({
        authenticated: false,
        message: 'Error getting session',
        error: sessionError,
        cookies: cookies
      });
    }
    
    if (!session || !session.user) {
      console.log('No valid session found');
      return NextResponse.json({
        authenticated: false,
        message: 'No valid session found',
        cookies: cookies
      });
    }
    
    console.log('User authenticated:', session.user.id);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at
      },
      cookies: cookies
    });
  } catch (error: any) {
    console.error('Error checking auth status:', error);
    return NextResponse.json({
      authenticated: false,
      message: 'Error checking auth status',
      error: error.message
    }, { status: 500 });
  }
}

// Helper function to extract auth token from cookie header with improved detection
function extractAuthToken(cookieHeader: string): string | null {
  // First, try to find the project-specific token (most common format)
  // Example: sb-eunobmaxqpryqyihtfwy-auth-token=...
  const projectTokenMatch = cookieHeader.match(/sb-[a-z0-9]+-auth-token=([^;]+)/);
  if (projectTokenMatch && projectTokenMatch[1]) {
    console.log('Found project-specific auth token');
    return decodeURIComponent(projectTokenMatch[1]);
  }
  
  // Try to find the generic sb-auth-token
  const genericTokenMatch = cookieHeader.match(/sb-auth-token=([^;]+)/);
  if (genericTokenMatch && genericTokenMatch[1]) {
    console.log('Found generic sb-auth-token');
    return decodeURIComponent(genericTokenMatch[1]);
  }
  
  // Try to find supabase-auth-token
  const supabaseTokenMatch = cookieHeader.match(/supabase-auth-token=([^;]+)/);
  if (supabaseTokenMatch && supabaseTokenMatch[1]) {
    console.log('Found supabase-auth-token');
    return decodeURIComponent(supabaseTokenMatch[1]);
  }
  
  // Try to find any token that looks like a JWT (as a last resort)
  const jwtMatch = cookieHeader.match(/=([a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/);
  if (jwtMatch && jwtMatch[1]) {
    console.log('Found JWT-like token');
    return jwtMatch[1];
  }
  
  console.log('No auth token found in cookie header');
  return null;
} 