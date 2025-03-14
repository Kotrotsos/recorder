import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Check if the current user is a lifetime supporter
 * @returns Promise<boolean> - True if the user is a lifetime supporter, false otherwise
 */
export async function isLifetimeSupporter(): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    // Check if the user has an active lifetime subscription
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', 'lifetime_supporter')
      .eq('status', 'active')
      .limit(1);
    
    if (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
    
    return subscriptions && subscriptions.length > 0;
  } catch (error) {
    console.error('Error checking lifetime supporter status:', error);
    return false;
  }
}

/**
 * Get the subscription details for the current user
 * @returns Promise<Subscription | null> - The subscription details or null if not found
 */
export async function getUserSubscription() {
  try {
    const supabase = createClientComponentClient();
    
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