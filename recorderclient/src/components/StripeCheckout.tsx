"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';

// Log the publishable key (but mask most of it for security)
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log('Stripe publishable key:', publishableKey ? 
  `${publishableKey.substring(0, 8)}...${publishableKey.substring(publishableKey.length - 4)}` : 
  'undefined');

// Initialize Stripe outside of the component to avoid multiple instances
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Check if Stripe loaded successfully
stripePromise.then(
  (stripe) => console.log('Stripe initialized successfully:', !!stripe),
  (error) => console.error('Failed to initialize Stripe:', error)
);

interface StripeCheckoutProps {
  priceId: string;
  buttonText: string;
  buttonClassName: string;
}

export default function StripeCheckout({ 
  priceId, 
  buttonText, 
  buttonClassName 
}: StripeCheckoutProps) {
  // Use the same useAuth hook that PricingPageClient uses
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get user details when authenticated
  useEffect(() => {
    const getUserDetails = async () => {
      if (isAuthenticated) {
        console.log('StripeCheckout - User is authenticated, getting details');
        try {
          const supabase = createClient();
          
          // Get the current session to extract the auth token
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('StripeCheckout - Error getting session:', sessionError);
            return;
          }
          
          if (session && session.access_token) {
            console.log('StripeCheckout - Auth token retrieved');
            setAuthToken(session.access_token);
          }
          
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('StripeCheckout - Error getting user details:', error);
            return;
          }
          
          if (user) {
            console.log('StripeCheckout - User details retrieved:', user.id);
            setUserId(user.id);
          }
        } catch (error) {
          console.error('StripeCheckout - Error in getUserDetails:', error);
        }
      } else {
        console.log('StripeCheckout - User is not authenticated');
        setUserId(null);
        setAuthToken(null);
      }
    };
    
    if (!authLoading) {
      getUserDetails();
    }
  }, [isAuthenticated, authLoading]);

  // Check if Stripe is loaded on component mount
  useEffect(() => {
    const checkStripe = async () => {
      try {
        const stripe = await stripePromise;
        setStripeLoaded(!!stripe);
        console.log('StripeCheckout - Stripe loaded:', !!stripe);
      } catch (error) {
        console.error('StripeCheckout - Error checking Stripe:', error);
        setStripeLoaded(false);
      }
    };
    
    checkStripe();
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    console.log('=== STARTING CHECKOUT PROCESS ===');
    console.log('StripeCheckout - Starting checkout with priceId:', priceId);
    console.log('StripeCheckout - Auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    console.log('StripeCheckout - Auth loading:', authLoading ? 'Loading' : 'Not loading');
    console.log('StripeCheckout - User ID:', userId);
    
    // Log the token (masked for security)
    const maskedToken = authToken ? 
      `${authToken.substring(0, 10)}...${authToken.substring(authToken.length - 10)}` : 
      'null';
    console.log('StripeCheckout - Auth token (masked):', maskedToken);
    console.log('StripeCheckout - Has auth token:', !!authToken);
    console.log('StripeCheckout - Stripe loaded:', stripeLoaded);

    // Check authentication before proceeding
    if (!isAuthenticated || !authToken) {
      console.error('StripeCheckout - User not authenticated or no auth token available');
      setErrorMessage('You must be logged in to become a supporter. Please log in and try again.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create checkout session on the server
      console.log('StripeCheckout - Calling API route...');
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include credentials in the fetch request
        credentials: 'include',
        body: JSON.stringify({ 
          priceId,
          authToken // Include the auth token in the request
        }),
      });

      console.log('StripeCheckout - API response status:', response.status);
      console.log('StripeCheckout - API response status text:', response.statusText);
      
      const data = await response.json();
      console.log('StripeCheckout - API response data:', data);

      if (data.error) {
        console.error('StripeCheckout - Error creating checkout session:', data.error);
        setErrorMessage(`Error: ${data.error}`);
        setIsLoading(false);
        return;
      }

      const { sessionId } = data;
      if (!sessionId) {
        console.error('StripeCheckout - No sessionId returned from API');
        setErrorMessage('No session ID returned from server');
        setIsLoading(false);
        return;
      }

      // 2. Get Stripe.js instance
      console.log('StripeCheckout - Getting Stripe instance...');
      const stripe = await stripePromise;
      
      if (!stripe) {
        console.error('StripeCheckout - Failed to load Stripe');
        setErrorMessage('Failed to load Stripe');
        setIsLoading(false);
        return;
      }

      // 3. Redirect to checkout
      console.log('StripeCheckout - Redirecting to Stripe checkout with sessionId:', sessionId);
      // Only pass the sessionId parameter, no additional options
      const { error } = await stripe.redirectToCheckout({ sessionId });

      // 4. Handle any errors from redirect
      if (error) {
        console.error('StripeCheckout - Stripe checkout error:', error);
        setErrorMessage(`Stripe error: ${error.message}`);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('StripeCheckout - Checkout error:', error);
      setErrorMessage(`Error: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {stripeLoaded === false && (
        <div className="mb-2 text-amber-500 text-sm">
          Warning: Stripe failed to initialize. Checkout may not work.
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={isLoading || authLoading}
        className={buttonClassName}
      >
        {isLoading ? 'Processing...' : authLoading ? 'Loading...' : buttonText}
      </button>
      
      {errorMessage && (
        <div className="mt-2 text-red-500 text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  );
} 