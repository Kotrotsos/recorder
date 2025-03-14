"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function AdminTools() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/update-subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription status');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 p-6">
      <div className="max-w-md mx-auto w-full">
        <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Admin Tools</CardTitle>
            <CardDescription className="text-white/70">
              Update user subscription status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSubscription} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-white">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update to Goldmember Status'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start border-t border-white/10 pt-4">
            {error && (
              <div className="w-full p-3 bg-red-500/20 border border-red-500/30 rounded-lg mb-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            {result && (
              <div className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-300 mb-2">Success! Subscription updated.</p>
                <pre className="text-xs text-white/70 overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 