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

export async function POST(req: NextRequest) {
  console.log('=== UPDATE SUBSCRIPTION STATUS API CALLED ===');
  
  try {
    // Parse the request body
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      console.error('No userId provided');
      return NextResponse.json(
        { error: 'No userId provided' },
        { status: 400 }
      );
    }
    
    console.log(`Updating subscription status for user: ${userId.substring(0, 8)}...`);
    
    // Check if the user already has a subscription
    const { data: existingSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching existing subscriptions:', fetchError);
      return NextResponse.json(
        { error: `Error fetching subscriptions: ${fetchError.message}` },
        { status: 500 }
      );
    }
    
    let result;
    
    // If the user already has a subscription, update it
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log('Existing subscription found, updating to goldmember status');
      
      const { data, error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'goldmember',
          plan_id: 'lifetime_supporter',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscriptions[0].id)
        .select();
      
      if (updateError) {
        console.error('Error updating subscription to goldmember:', updateError);
        return NextResponse.json(
          { error: `Error updating subscription: ${updateError.message}` },
          { status: 500 }
        );
      }
      
      result = data;
      console.log('Successfully updated subscription to goldmember status');
    } else {
      // If the user doesn't have a subscription, create a new one
      console.log('No existing subscription found, creating new goldmember subscription');
      
      // Set a far future date for current_period_end (100 years from now)
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);
      
      const { data, error: insertError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: 'lifetime_supporter',
          status: 'goldmember',
          current_period_start: new Date().toISOString(),
          current_period_end: farFutureDate.toISOString(), // Use far future date instead of null
          cancel_at_period_end: false,
          payment_provider: 'stripe',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('Error creating goldmember subscription:', insertError);
        return NextResponse.json(
          { error: `Error creating subscription: ${insertError.message}` },
          { status: 500 }
        );
      }
      
      result = data;
      console.log('Successfully created goldmember subscription');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription status updated to goldmember',
      subscription: result
    });
    
  } catch (error: any) {
    console.error('Error in update-subscription-status API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 