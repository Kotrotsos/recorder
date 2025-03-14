# Stripe Webhook Edge Function

This Supabase Edge Function handles Stripe webhook events, particularly for processing successful payments for the Lifetime Supporter plan.

## Functionality

- Processes `checkout.session.completed` events from Stripe
- Verifies webhook signatures for security
- Creates subscription records in the database for successful payments
- Handles CORS for cross-origin requests
- Provides detailed error handling and logging

## Deployment

To deploy this edge function:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project (if not already linked):
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy stripe-webhook
   ```

5. Set the required secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   supabase secrets set SUPABASE_URL=https://your-project.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Webhook Configuration in Stripe

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-project.functions.supabase.co/stripe-webhook`
4. Select the events to listen for:
   - `checkout.session.completed`
5. Get your webhook signing secret from the Stripe dashboard
6. Set it as the `STRIPE_WEBHOOK_SECRET` in your Supabase secrets

## Testing

You can test the webhook using Stripe's CLI:

```bash
stripe listen --forward-to https://your-project.functions.supabase.co/stripe-webhook
```

Then trigger a test event:

```bash
stripe trigger checkout.session.completed
```

## Troubleshooting

- Check the logs in the Supabase dashboard
- Verify that all required environment variables are set
- Ensure the webhook URL is correctly configured in Stripe
- Confirm that the webhook signing secret matches the one in Stripe 