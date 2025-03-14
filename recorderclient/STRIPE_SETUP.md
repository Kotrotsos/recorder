# Stripe Setup Guide

This guide explains how to set up Stripe for the Lifetime Supporter payment option.

## Prerequisites

1. A Stripe account (create one at [stripe.com](https://stripe.com) if you don't have one)
2. Access to the Stripe Dashboard

## Step 1: Create a Product

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** in the sidebar
3. Click **+ Add Product**
4. Fill in the product details:
   - **Name**: Lifetime Supporter
   - **Description**: Lifetime access to all premium features and early access to new features
   - **Image**: (Optional) Upload an image representing the supporter plan
5. Click **Save Product**

## Step 2: Create a Price

1. In the product details page, scroll down to the **Pricing** section
2. Click **+ Add pricing**
3. Fill in the price details:
   - **Type**: One time
   - **Price**: $29.99
   - **Currency**: USD (or your preferred currency)
4. Click **Save price**

## Step 3: Get the Price ID

1. After saving the price, you'll be back on the product details page
2. Find your newly created price in the **Pricing** section
3. Click the **...** (three dots) next to the price
4. Select **Copy ID**
5. The copied ID should start with `price_` (e.g., `price_1OxYZAG1OX3gPFMJLADYDB3bv`)

## Step 4: Update Environment Variables

1. Open your `.env.local` file
2. Update the `NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME` variable with your copied price ID:

```
NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME=price_your_copied_id_here
```

3. Make sure your success and cancel URLs match your server's port:

```
STRIPE_SUCCESS_URL=http://localhost:3001/payment/success
STRIPE_CANCEL_URL=http://localhost:3001/pricing
```

4. Save the file and restart your development server

## Step 5: Test the Payment Flow

1. Navigate to the pricing page
2. Click the "Become a Supporter" button
3. You should be redirected to the Stripe Checkout page
4. Test the payment using Stripe's test card numbers:
   - Card number: `4242 4242 4242 4242`
   - Expiration date: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

## Troubleshooting

### Error: No such price

If you see an error like `No such price: 'prod_RwCNpJzs4emdLf'`, you're using a product ID instead of a price ID. Make sure the ID starts with `price_` and not `prod_`.

### "Something went wrong" error page

If you're redirected to a Stripe error page saying "Something went wrong":

1. **Check your browser console** for any JavaScript errors
2. **Check your server logs** for detailed error information
3. **Verify your price ID** exists in your Stripe dashboard
4. **Check your success and cancel URLs** match your server's port
5. **Verify your Stripe account status** is active and not restricted

### Payment not working in test mode

Make sure you're using Stripe's test card numbers. In test mode, real cards will be declined.

### Webhook events not being received

If you're using webhooks to handle post-payment actions, make sure your webhook endpoint is properly configured in the Stripe Dashboard and that you're using the correct webhook signing secret.

### CORS issues

If you're seeing CORS errors in your console:

1. Make sure your API route is properly handling CORS
2. Check that your Stripe publishable key is from the same account as your secret key
3. Verify that your domain is allowed in your Stripe dashboard settings

### Stripe checkout not loading

If the Stripe checkout page doesn't load:

1. Check that your Stripe publishable key is correct
2. Verify that your browser isn't blocking third-party cookies
3. Try using a different browser to rule out browser-specific issues
4. Check your network tab for any failed requests 