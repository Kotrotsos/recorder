import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Log the secret key (but mask most of it for security)
const secretKey = process.env.STRIPE_SECRET_KEY;
console.log('Stripe secret key:', secretKey ? 
  `${secretKey.substring(0, 8)}...${secretKey.substring(secretKey.length - 4)}` : 
  'undefined');

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  console.log('=== API ROUTE CALLED ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  
  // Log request headers (without sensitive info)
  const headers = Object.fromEntries(req.headers.entries());
  console.log('Request headers:', {
    'content-type': headers['content-type'],
    'user-agent': headers['user-agent'],
    'referer': headers['referer'],
    'cookie': headers['cookie'] ? 'Present (not shown for security)' : 'Not present',
    'x-forwarded-for': headers['x-forwarded-for'],
  });
  
  try {
    // Parse the request body
    const body = await req.json();
    const { priceId, authToken } = body;
    
    console.log('Request body received:', { 
      priceId, 
      hasAuthToken: !!authToken,
      // Log the first and last few characters of the token if present
      authTokenPreview: authToken ? 
        `${authToken.substring(0, 10)}...${authToken.substring(authToken.length - 10)}` : 
        'not provided'
    });
    
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
    
    // Try to authenticate with the provided token first
    let authSession = null;
    
    if (authToken) {
      console.log('Auth token provided in request body, attempting to use it...');
      try {
        // Set the auth token for this request
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: authToken,
          refresh_token: '',
        });
        
        if (sessionError) {
          console.error('Error setting session with provided token:', sessionError);
        } else if (sessionData.session) {
          console.log('Successfully authenticated with provided token');
          authSession = sessionData.session;
        }
        
        // If setSession didn't work, try getUser directly with the token
        if (!authSession) {
          const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
          
          if (userError) {
            console.error('Error getting user with provided token:', userError);
          } else if (userData.user) {
            console.log('Successfully retrieved user with provided token');
            // Create a minimal session object with the user
            authSession = {
              user: userData.user,
              access_token: authToken,
              refresh_token: '',
              expires_at: 0,
              expires_in: 0,
            };
          }
        }
      } catch (error) {
        console.error('Error using provided token:', error);
      }
    }
    
    // If we couldn't authenticate with the provided token, try cookies as fallback
    if (!authSession) {
      console.log('Attempting to get auth session from cookies...');
      
      // Extract auth token from cookie header with improved detection
      const cookieAuthToken = extractAuthToken(cookieHeader);
      
      if (cookieAuthToken) {
        console.log('Auth token found in cookies, setting session...');
        
        try {
          // Set the auth token for this request
          await supabase.auth.setSession({
            access_token: cookieAuthToken,
            refresh_token: '',
          });
          console.log('Session set successfully from cookie token');
        } catch (sessionError) {
          console.error('Error setting session from cookie token:', sessionError);
        }
      } else {
        console.log('No auth token found in cookies');
        
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
      }
      
      // Get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
      } else if (session) {
        console.log('Successfully authenticated with cookie token');
        authSession = session;
      }
    }
    
    // Final authentication check
    if (!authSession || !authSession.user) {
      console.error('User not authenticated - No valid session found');
      return NextResponse.json(
        { error: 'You must be logged in to become a supporter. Please include your auth token in the request.' },
        { status: 401 }
      );
    }
    
    const user = authSession.user;
    console.log('User authenticated:', user.id);
    console.log('User email:', user.email);
    console.log('User created at:', new Date(user.created_at).toISOString());
    
    if (!priceId) {
      console.error('No priceId provided');
      return NextResponse.json(
        { error: 'No price ID provided' },
        { status: 400 }
      );
    }
    
    console.log('Price ID:', priceId);
    console.log('Success URL:', process.env.STRIPE_SUCCESS_URL);
    console.log('Cancel URL:', process.env.STRIPE_CANCEL_URL);
    
    // Verify that the price exists before creating a session
    try {
      console.log('Verifying price exists...');
      const price = await stripe.prices.retrieve(priceId);
      console.log('Price verified:', {
        id: price.id,
        active: price.active,
        currency: price.currency,
        unit_amount: price.unit_amount,
      });
    } catch (priceError: any) {
      console.error('Error retrieving price:', priceError);
      return NextResponse.json(
        { error: `Price verification failed: ${priceError.message}` },
        { status: 400 }
      );
    }
    
    // Create Checkout Session with all necessary parameters
    console.log('Creating Stripe checkout session...');
    const stripeSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS_URL!,
      cancel_url: process.env.STRIPE_CANCEL_URL!,
      metadata: {
        plan: 'lifetime',
        userId: user.id,
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      locale: 'auto', // Set locale on the server side
      submit_type: 'pay',
      custom_text: {
        submit: {
          message: 'We\'ll provide access to supporter features immediately after your payment is processed.',
        },
      },
      payment_intent_data: {
        description: 'Lifetime Supporter Plan',
        metadata: {
          userId: user.id,
          plan: 'lifetime',
        },
      },
      customer_email: user.email,
    });

    console.log('Session created:', stripeSession.id);
    console.log('Checkout URL:', stripeSession.url);
    
    // Just return the session ID - Stripe.js will handle the redirect
    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error: any) {
    console.error('=== ERROR CREATING CHECKOUT SESSION ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      detail: error.detail,
      statusCode: error.statusCode,
      requestId: error.requestId,
    });
    
    // Provide a more helpful error message based on the error type
    let errorMessage = error.message;
    
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Authentication with Stripe failed. Please check your API keys.';
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Invalid request to Stripe: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.statusCode || 500 }
    );
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