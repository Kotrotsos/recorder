import { createClient } from '@/lib/supabase';

/**
 * Check if the current user is a lifetime supporter
 * @returns Promise<boolean> - True if the user is a lifetime supporter, false otherwise
 */
export async function isLifetimeSupporter(): Promise<boolean> {
  try {
    console.log('isLifetimeSupporter - Starting check');
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('isLifetimeSupporter - Error getting user:', userError);
      return false;
    }
    
    if (!user) {
      console.log('isLifetimeSupporter - No user found');
      return false;
    }
    
    console.log(`isLifetimeSupporter - Checking subscription for user: ${user.id.substring(0, 8)}...`);
    
    // Check if the user has an active lifetime subscription
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', 'lifetime_supporter')
      .or('status.eq.active,status.eq.goldmember'); // Check for both active and goldmember status
    
    if (error) {
      console.error('isLifetimeSupporter - Error checking subscription status:', error);
      return false;
    }
    
    console.log(`isLifetimeSupporter - Found ${subscriptions?.length || 0} subscriptions:`, subscriptions);
    
    // Log each subscription for debugging
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach((sub, index) => {
        console.log(`isLifetimeSupporter - Subscription ${index + 1}:`, {
          id: sub.id,
          user_id: sub.user_id,
          plan_id: sub.plan_id,
          status: sub.status,
          created_at: sub.created_at
        });
      });
    }
    
    const isSupporter = subscriptions && subscriptions.length > 0;
    console.log(`isLifetimeSupporter - Result: ${isSupporter ? 'Is supporter' : 'Not a supporter'}`);
    return isSupporter;
  } catch (error) {
    console.error('isLifetimeSupporter - Error checking lifetime supporter status:', error);
    return false;
  }
}

/**
 * Get the subscription details for the current user
 * @returns Promise<Subscription | null> - The subscription details or null if not found
 */
export async function getUserSubscription() {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Get the user's subscription
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
    
    return subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

/**
 * Update the user's subscription status to 'goldmember'
 * @returns Promise<boolean> - True if the update was successful, false otherwise
 */
export async function updateToGoldmemberStatus(): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // If no user is found in the session, try to get userId from URL query parameters
    let userId = user?.id;
    
    if (!userId) {
      console.log('No user found in session, checking URL for userId...');
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlUserId = urlParams.get('userId');
        
        if (urlUserId) {
          userId = urlUserId;
          console.log(`Found userId in URL parameters: ${userId.substring(0, 8)}...`);
        } else {
          console.error('No user found in session and no userId in URL parameters');
          return false;
        }
      } else {
        console.error('No user found when trying to update to goldmember status');
        return false;
      }
    }
    
    // Check if the user already has a subscription
    const { data: existingSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching existing subscriptions:', fetchError);
      return false;
    }
    
    // If the user already has a subscription, update it
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'goldmember',
          plan_id: 'lifetime_supporter',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscriptions[0].id);
      
      if (updateError) {
        console.error('Error updating subscription to goldmember:', updateError);
        return false;
      }
      
      console.log('Successfully updated subscription to goldmember status');
      return true;
    } 
    
    // If the user doesn't have a subscription, create a new one
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: 'lifetime_supporter',
        status: 'goldmember',
        current_period_start: new Date().toISOString(),
        current_period_end: null, // Lifetime subscription doesn't end
        cancel_at_period_end: false,
        payment_provider: 'stripe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error creating goldmember subscription:', insertError);
      return false;
    }
    
    console.log('Successfully created goldmember subscription');
    return true;
  } catch (error) {
    console.error('Error updating to goldmember status:', error);
    return false;
  }
} 