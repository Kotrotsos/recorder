"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function VerifyStripePage() {
  const [clientStatus, setClientStatus] = useState<string>('Checking...');
  const [serverStatus, setServerStatus] = useState<string>('Checking...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check client-side Stripe initialization
    const checkClientStripe = async () => {
      try {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
          setClientStatus('❌ Publishable key is missing');
          return;
        }
        
        // Mask the key for display
        const maskedKey = `${publishableKey.substring(0, 8)}...${publishableKey.substring(publishableKey.length - 4)}`;
        
        // Try to initialize Stripe
        const stripePromise = loadStripe(publishableKey);
        const stripe = await stripePromise;
        
        if (stripe) {
          setClientStatus(`✅ Stripe initialized successfully (${maskedKey})`);
        } else {
          setClientStatus(`❌ Failed to initialize Stripe (${maskedKey})`);
        }
      } catch (err: any) {
        setClientStatus(`❌ Error: ${err.message}`);
      }
    };
    
    // Check server-side Stripe API key
    const checkServerStripe = async () => {
      try {
        const response = await fetch('/api/verify-stripe-keys');
        const data = await response.json();
        
        if (data.success) {
          setServerStatus(`✅ ${data.message}`);
        } else {
          setServerStatus(`❌ ${data.message}`);
        }
      } catch (err: any) {
        setServerStatus(`❌ Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkClientStripe();
    checkServerStripe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Stripe API Key Verification</h1>
        
        <div className="space-y-6">
          <div className="bg-black/30 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Client-Side (Publishable Key)</h2>
            <p className={`${clientStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {clientStatus}
            </p>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Server-Side (Secret Key)</h2>
            <p className={`${serverStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {serverStatus}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/20 p-4 rounded-lg">
              <p className="text-white">Error: {error}</p>
            </div>
          )}
          
          <div className="bg-white/5 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Troubleshooting Tips</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2">
              <li>Make sure your Stripe API keys are correctly set in .env.local</li>
              <li>Verify that you're using test keys (starting with pk_test_ and sk_test_)</li>
              <li>Check that the publishable key and secret key are from the same Stripe account</li>
              <li>Ensure your Stripe account is active and not restricted</li>
              <li>Try creating a new set of API keys in the Stripe dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 