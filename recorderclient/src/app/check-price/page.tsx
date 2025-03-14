"use client";

import { useEffect, useState } from 'react';

export default function CheckPricePage() {
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkPrice() {
      try {
        const response = await fetch('/api/verify-price');
        const data = await response.json();
        
        setPriceData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    }
    
    checkPrice();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Price Verification</h1>
        
        {loading ? (
          <p className="text-white">Loading price information...</p>
        ) : error ? (
          <div className="bg-red-500/20 p-4 rounded-lg">
            <p className="text-white">Error: {error}</p>
          </div>
        ) : priceData?.exists ? (
          <div className="space-y-4">
            <div className="bg-green-500/20 p-4 rounded-lg mb-4">
              <p className="text-white">✅ Price exists in your Stripe account</p>
            </div>
            
            <h2 className="text-xl font-semibold text-white">Price Details:</h2>
            <ul className="space-y-2 text-white/80">
              <li><strong>ID:</strong> {priceData.price.id}</li>
              <li><strong>Active:</strong> {priceData.price.active ? 'Yes' : 'No'}</li>
              <li><strong>Currency:</strong> {priceData.price.currency}</li>
              <li><strong>Amount:</strong> {(priceData.price.unit_amount / 100).toFixed(2)}</li>
              <li><strong>Product:</strong> {priceData.price.product}</li>
              <li><strong>Type:</strong> {priceData.price.type}</li>
            </ul>
          </div>
        ) : (
          <div className="bg-red-500/20 p-4 rounded-lg">
            <p className="text-white">❌ Price does not exist in your Stripe account</p>
            {priceData?.error && (
              <p className="text-white/80 mt-2">Error: {priceData.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 