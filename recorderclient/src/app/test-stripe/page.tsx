"use client";

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe outside of the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function TestStripePage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const createCheckoutSession = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME 
        }),
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.error) {
        setError(data.error);
      } else if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToStripe = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Get Stripe instance
      const stripe = await stripePromise;
      if (!stripe) {
        setError('Failed to load Stripe');
        setIsLoading(false);
        return;
      }
      
      // Redirect to checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        setError(`Stripe error: ${error.message}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Stripe Checkout Test</h1>
        
        <div className="space-y-6">
          <div>
            <button
              onClick={createCheckoutSession}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-xl transition-colors"
            >
              {isLoading ? 'Creating session...' : 'Create Checkout Session'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-500/20 p-4 rounded-lg">
              <p className="text-white">Error: {error}</p>
            </div>
          )}
          
          {sessionId && (
            <div className="space-y-4">
              <div className="bg-green-500/20 p-4 rounded-lg">
                <p className="text-white">✅ Session created: {sessionId}</p>
              </div>
              
              <button
                onClick={redirectToStripe}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-xl transition-colors"
              >
                {isLoading ? 'Redirecting...' : 'Redirect to Stripe Checkout'}
              </button>
            </div>
          )}
          
          {result && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-white mb-2">API Response:</h2>
              <pre className="bg-black/30 p-4 rounded-lg text-white/80 text-sm overflow-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 