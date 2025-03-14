import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    // Check if the secret key is set
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ 
        success: false, 
        message: 'Secret key is missing in environment variables' 
      });
    }

    // Mask the key for logging
    const maskedKey = `${secretKey.substring(0, 8)}...${secretKey.substring(secretKey.length - 4)}`;
    console.log(`Verifying Stripe secret key: ${maskedKey}`);

    // Initialize Stripe with the secret key
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });

    // Make a simple API call to verify the key works
    // We'll just retrieve the balance which is a lightweight call
    const balance = await stripe.balance.retrieve();

    return NextResponse.json({ 
      success: true, 
      message: `Secret key verified successfully (${maskedKey})`,
      available: balance.available.length > 0
    });
  } catch (error: any) {
    console.error('Error verifying Stripe secret key:', error);
    
    let errorMessage = 'Failed to verify Stripe secret key';
    
    // Provide more specific error messages based on the error type
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Authentication failed: Invalid API key';
    } else if (error.type === 'StripeConnectionError') {
      errorMessage = 'Connection to Stripe API failed';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      error: error.type || 'unknown_error'
    }, { status: 500 });
  }
} 