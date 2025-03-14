"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import SupporterBadge from '@/components/SupporterBadge';
import { isLifetimeSupporter } from '@/utils/subscription';

export default function CheckStatus() {
  const [user, setUser] = useState<any>(null);
  const [isSupporter, setIsSupporter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiSubscriptions, setApiSubscriptions] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  
  const supabase = createClient();
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error(`Error getting user: ${userError.message}`);
        }
        
        if (!user) {
          throw new Error('No user found. Please log in.');
        }
        
        setUser(user);
        
        // Check if the user is a supporter
        const supporter = await isLifetimeSupporter();
        setIsSupporter(supporter);
        
        // Get the user's subscriptions
        const { data: subs, error: subsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);
        
        if (subsError) {
          throw new Error(`Error getting subscriptions: ${subsError.message}`);
        }
        
        setSubscriptions(subs || []);
        
        // Also check using the API endpoint
        await checkSubscriptionApi(user.id);
        
      } catch (err: any) {
        console.error('Error checking status:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [supabase]);
  
  const checkSubscriptionApi = async (userId: string) => {
    try {
      setApiLoading(true);
      const response = await fetch(`/api/check-subscription?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check subscription via API');
      }
      
      const data = await response.json();
      setApiSubscriptions(data);
    } catch (err: any) {
      console.error('Error checking subscription via API:', err);
      setError(prev => prev || err.message || 'Error checking subscription via API');
    } finally {
      setApiLoading(false);
    }
  };
  
  const refreshStatus = () => {
    setLoading(true);
    setError(null);
    setApiSubscriptions(null);
    if (user) {
      checkSubscriptionApi(user.id);
    }
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 p-6">
      <div className="max-w-md mx-auto w-full">
        <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Goldmember Status Check</CardTitle>
            <CardDescription className="text-white/70">
              Check your current subscription status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300">{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-lg">
                  <h3 className="text-white font-medium mb-2">User Information</h3>
                  <p className="text-white/80 text-sm">ID: {user?.id}</p>
                  <p className="text-white/80 text-sm">Email: {user?.email}</p>
                </div>
                
                <div className="p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Supporter Status</h3>
                    {isSupporter && <SupporterBadge />}
                  </div>
                  <p className="text-white/80 text-sm">
                    {isSupporter 
                      ? "You are a Goldmember! You have access to all premium features."
                      : "You are not currently a Goldmember."}
                  </p>
                </div>
                
                <div className="p-4 bg-white/10 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Client-Side Subscription Details</h3>
                  {subscriptions.length === 0 ? (
                    <p className="text-white/80 text-sm">No subscription records found.</p>
                  ) : (
                    <div className="space-y-2">
                      {subscriptions.map((sub, index) => (
                        <div key={index} className="p-2 bg-white/5 rounded border border-white/10">
                          <p className="text-white/80 text-xs">Plan: {sub.plan_id}</p>
                          <p className="text-white/80 text-xs">Status: <span className={sub.status === 'goldmember' ? 'text-amber-400 font-medium' : ''}>{sub.status}</span></p>
                          <p className="text-white/80 text-xs">Created: {new Date(sub.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-white/10 rounded-lg">
                  <h3 className="text-white font-medium mb-2">API Subscription Check</h3>
                  {apiLoading ? (
                    <div className="flex justify-center py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  ) : !apiSubscriptions ? (
                    <p className="text-white/80 text-sm">No API subscription data available.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-white/80 text-sm">
                        Is Lifetime Supporter: <span className={apiSubscriptions.isLifetimeSupporter ? 'text-amber-400 font-medium' : ''}>{apiSubscriptions.isLifetimeSupporter ? 'Yes' : 'No'}</span>
                      </p>
                      <p className="text-white/80 text-sm">Subscriptions Count: {apiSubscriptions.subscriptionsCount}</p>
                      
                      {apiSubscriptions.lifetimeSubscriptions.length > 0 && (
                        <div>
                          <p className="text-white/80 text-sm font-medium mt-2">Lifetime Subscriptions:</p>
                          {apiSubscriptions.lifetimeSubscriptions.map((sub: any, index: number) => (
                            <div key={index} className="p-2 bg-white/5 rounded border border-white/10 mt-1">
                              <p className="text-white/80 text-xs">ID: {sub.id}</p>
                              <p className="text-white/80 text-xs">Plan: {sub.plan_id}</p>
                              <p className="text-white/80 text-xs">Status: <span className={sub.status === 'goldmember' ? 'text-amber-400 font-medium' : ''}>{sub.status}</span></p>
                              <p className="text-white/80 text-xs">Created: {new Date(sub.created_at).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-white/10 pt-4">
            <Button 
              onClick={refreshStatus} 
              className="bg-white/10 hover:bg-white/20 text-white"
              disabled={loading}
            >
              Refresh Status
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 