"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserSubscription } from '@/utils/subscription';
import SupporterBadge from '@/components/SupporterBadge';

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        const sub = await getUserSubscription();
        setSubscription(sub);
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setError(err.message || 'Failed to verify your subscription');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 max-w-md w-full text-center">
        {isLoading ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">Processing your payment...</h1>
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white/80">Please wait while we verify your payment.</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            <p className="text-red-300">{error}</p>
            <p className="text-white/80">
              Don't worry, if your payment was successful, your account will be updated shortly.
              If you continue to see this error, please contact support.
            </p>
            <div className="mt-6">
              <Link 
                href="/"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-medium rounded-lg transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white">Thank You!</h1>
            
            <div className="flex justify-center">
              <SupporterBadge className="mt-2" />
            </div>
            
            <p className="text-white/90 text-lg">
              Your payment was successful and you are now a Lifetime Supporter!
            </p>
            
            <div className="bg-black/20 p-4 rounded-lg">
              <p className="text-white/80">
                You now have access to all current and future premium features as they are released.
                Thank you for supporting this indie project!
              </p>
            </div>
            
            {subscription && (
              <div className="text-left bg-black/20 p-4 rounded-lg">
                <h2 className="text-white font-medium mb-2">Subscription Details</h2>
                <ul className="space-y-1 text-sm text-white/70">
                  <li><span className="text-white/50">Plan:</span> Lifetime Supporter</li>
                  <li><span className="text-white/50">Status:</span> {subscription.status}</li>
                  <li><span className="text-white/50">Date:</span> {new Date(subscription.created_at).toLocaleDateString()}</li>
                </ul>
              </div>
            )}
            
            <div className="mt-6 space-x-4">
              <Link 
                href="/"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-medium rounded-lg transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 