"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe outside of the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [serverAuthStatus, setServerAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<any>(null);
  const [serverUser, setServerUser] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');
  const [serverCookies, setServerCookies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    // Check client-side authentication status
    const checkClientAuth = async () => {
      try {
        const supabase = createClient();
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
          setAuthStatus('unauthenticated');
          return;
        }
        
        if (session && session.user) {
          console.log('User is authenticated:', session.user.id);
          setUser(session.user);
          setAuthStatus('authenticated');
          
          // Store the auth token
          if (session.access_token) {
            setAuthToken(session.access_token);
            console.log('Auth token retrieved');
          }
        } else {
          console.log('User is not authenticated');
          setAuthStatus('unauthenticated');
          setAuthToken(null);
        }
        
        // Get cookies
        setCookies(document.cookie);
      } catch (err: any) {
        console.error('Error in checkClientAuth:', err);
        setError(err.message);
        setAuthStatus('unauthenticated');
      }
    };
    
    // Check server-side authentication status
    const checkServerAuth = async () => {
      try {
        const response = await fetch('/api/auth-status', {
          credentials: 'include' // Important: include cookies in the request
        });
        
        const data = await response.json();
        console.log('Server auth status:', data);
        
        if (data.authenticated) {
          setServerAuthStatus('authenticated');
          setServerUser(data.user);
        } else {
          setServerAuthStatus('unauthenticated');
          setServerError(data.message || 'Not authenticated');
        }
        
        if (data.cookies) {
          setServerCookies(data.cookies);
        }
      } catch (err: any) {
        console.error('Error checking server auth:', err);
        setServerError(err.message);
        setServerAuthStatus('unauthenticated');
      }
    };
    
    checkClientAuth();
    checkServerAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const supabase = createClient();
      
      // Sign in with magic link (email)
      const email = prompt('Enter your email to sign in:');
      if (!email) return;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-test`,
        },
      });
      
      if (error) {
        console.error('Error signing in:', error);
        setError(error.message);
        return;
      }
      
      alert('Check your email for the login link!');
    } catch (err: any) {
      console.error('Error in handleLogin:', err);
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      
      // Sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        setError(error.message);
        return;
      }
      
      setUser(null);
      setAuthStatus('unauthenticated');
      setServerUser(null);
      setServerAuthStatus('unauthenticated');
      setAuthToken(null);
      
      // Reload the page to update all states
      window.location.reload();
    } catch (err: any) {
      console.error('Error in handleLogout:', err);
      setError(err.message);
    }
  };

  const handleDirectCheckout = async () => {
    if (!authToken) {
      setCheckoutError('No auth token available. Please log in first.');
      return;
    }
    
    setIsLoading(true);
    setCheckoutError(null);
    
    try {
      // Log the token (masked for security)
      const maskedToken = authToken ? 
        `${authToken.substring(0, 10)}...${authToken.substring(authToken.length - 10)}` : 
        'null';
      console.log('Auth token for checkout (masked):', maskedToken);
      
      // 1. Create checkout session on the server
      console.log('Calling API route directly...');
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME,
          authToken // Include the auth token in the request
        }),
      });

      console.log('API response status:', response.status);
      
      const data = await response.json();
      console.log('API response data:', data);

      if (data.error) {
        console.error('Error creating checkout session:', data.error);
        setCheckoutError(`Error: ${data.error}`);
        setIsLoading(false);
        return;
      }

      const { sessionId } = data;
      if (!sessionId) {
        console.error('No sessionId returned from API');
        setCheckoutError('No session ID returned from server');
        setIsLoading(false);
        return;
      }

      // 2. Get Stripe.js instance
      console.log('Getting Stripe instance...');
      const stripe = await stripePromise;
      
      if (!stripe) {
        console.error('Failed to load Stripe');
        setCheckoutError('Failed to load Stripe');
        setIsLoading(false);
        return;
      }

      // 3. Redirect to checkout
      console.log('Redirecting to Stripe checkout with sessionId:', sessionId);
      const { error } = await stripe.redirectToCheckout({ sessionId });

      // 4. Handle any errors from redirect
      if (error) {
        console.error('Stripe checkout error:', error);
        setCheckoutError(`Stripe error: ${error.message}`);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setCheckoutError(`Error: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Client Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {serverError && (
          <div className="mb-6 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded">
            <p className="font-bold">Server Error:</p>
            <p>{serverError}</p>
          </div>
        )}
        
        {checkoutError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Checkout Error:</p>
            <p>{checkoutError}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Client-Side Auth Status</h2>
            <div className="p-4 border rounded">
              {authStatus === 'loading' ? (
                <p>Loading authentication status...</p>
              ) : authStatus === 'authenticated' ? (
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="font-medium text-green-700">Authenticated</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="font-medium text-red-700">Not Authenticated</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Server-Side Auth Status</h2>
            <div className="p-4 border rounded">
              {serverAuthStatus === 'loading' ? (
                <p>Loading server authentication status...</p>
              ) : serverAuthStatus === 'authenticated' ? (
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="font-medium text-green-700">Authenticated</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="font-medium text-red-700">Not Authenticated</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {authToken && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Auth Token</h2>
            <div className="p-4 border rounded bg-gray-50 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Access Token:</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(authToken);
                    alert('Auth token copied to clipboard!');
                  }}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-xs break-all">
                {authToken.substring(0, 20)}...{authToken.substring(authToken.length - 20)}
              </pre>
              <p className="mt-2 text-sm text-gray-500">
                This token can be used for direct API authentication when cookies aren't working.
              </p>
            </div>
          </div>
        )}
        
        {user && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Client User Information</h2>
            <div className="p-4 border rounded bg-gray-50 overflow-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>
        )}
        
        {serverUser && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Server User Information</h2>
            <div className="p-4 border rounded bg-gray-50 overflow-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(serverUser, null, 2)}</pre>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Client-Side Cookies</h2>
            <div className="p-4 border rounded bg-gray-50 overflow-auto max-h-60">
              <pre className="whitespace-pre-wrap">{cookies || 'No cookies found'}</pre>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Server-Side Cookies</h2>
            <div className="p-4 border rounded bg-gray-50 overflow-auto max-h-60">
              {serverCookies.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Name</th>
                      <th className="text-left py-1">Value (masked)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serverCookies.map((cookie, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-1 pr-2">{cookie.name}</td>
                        <td className="py-1">{cookie.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No cookies found</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          {authStatus === 'unauthenticated' ? (
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          )}
          
          <Link href="/pricing" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Go to Pricing Page
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Status
          </button>
          
          {authToken && (
            <button
              onClick={handleDirectCheckout}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-amber-400"
            >
              {isLoading ? 'Processing...' : 'Test Direct Checkout'}
            </button>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Troubleshooting Tips</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-blue-800">
            <li>If you're authenticated on client but not server, try the "Test Direct Checkout" button</li>
            <li>Make sure you're accessing the site through the same domain/port consistently</li>
            <li>Try clearing your browser cookies and signing in again</li>
            <li>Check browser console for any errors</li>
            <li>Try using a different browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 