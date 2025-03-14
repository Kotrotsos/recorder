import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the webhook secret
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    // Get the signature from the headers
    const sig = req.headers.get('stripe-signature');
    
    if (!sig || !endpointSecret) {
      console.error('Missing signature or endpoint secret');
      return new Response(
        JSON.stringify({ error: 'Missing signature or endpoint secret' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get the raw body
    const payload = await req.text();
    
    // Verify the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Log the session for debugging
      console.log('Checkout session completed:', {
        id: session.id,
        customer: session.customer,
        metadata: session.metadata,
        payment_status: session.payment_status,
      });

      // Make sure this is for the lifetime supporter plan
      if (session.metadata?.plan === 'lifetime') {
        // Get the customer details
        const customerId = session.customer;
        const customer = await stripe.customers.retrieve(customerId);
        
        if (!customer || customer.deleted) {
          console.error('Customer not found or deleted');
          return new Response(
            JSON.stringify({ error: 'Customer not found' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
        
        // Get the user ID from the customer metadata or session metadata
        const userId = session.metadata?.userId || customer.metadata?.userId;
        
        if (!userId) {
          console.error('User ID not found in metadata');
          return new Response(
            JSON.stringify({ error: 'User ID not found' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
        
        // Add the subscription to the database
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: 'lifetime_supporter',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: null, // Lifetime subscription doesn't end
            cancel_at_period_end: false,
            payment_provider: 'stripe',
            payment_provider_subscription_id: session.id,
            metadata: {
              stripe_customer_id: customerId,
              payment_intent: session.payment_intent,
              amount_total: session.amount_total,
              payment_status: session.payment_status,
            },
          });
        
        if (error) {
          console.error('Error adding subscription to database:', error);
          return new Response(
            JSON.stringify({ error: 'Error adding subscription to database' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }
        
        console.log('Subscription added to database:', data);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 