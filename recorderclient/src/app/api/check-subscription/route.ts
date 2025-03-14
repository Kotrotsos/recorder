import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
// This bypasses RLS policies
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(req: NextRequest) {
  console.log('=== CHECK SUBSCRIPTION API CALLED ===');
  
  // Get the user ID from the query parameters
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'No userId provided' },
      { status: 400 }
    );
  }
  
  console.log(`Checking subscription for user: ${userId.substring(0, 8)}...`);
  
  try {
    // Check if the user has any subscriptions
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { error: `Error fetching subscriptions: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Check if the user has a lifetime supporter subscription
    const lifetimeSubscriptions = subscriptions?.filter(sub => 
      sub.plan_id === 'lifetime_supporter' && 
      (sub.status === 'active' || sub.status === 'goldmember')
    ) || [];
    
    // Return the subscription details
    return NextResponse.json({
      userId,
      hasSubscriptions: subscriptions && subscriptions.length > 0,
      subscriptionsCount: subscriptions?.length || 0,
      subscriptions: subscriptions || [],
      isLifetimeSupporter: lifetimeSubscriptions.length > 0,
      lifetimeSubscriptions
    });
    
  } catch (error: any) {
    console.error('Error in check-subscription API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 