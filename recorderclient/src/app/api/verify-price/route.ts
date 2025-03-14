import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  try {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME;
    
    console.log('Verifying price ID:', priceId);
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'No price ID provided in environment variables' },
        { status: 400 }
      );
    }
    
    // Try to retrieve the price from Stripe
    const price = await stripe.prices.retrieve(priceId);
    
    return NextResponse.json({
      exists: true,
      price: {
        id: price.id,
        active: price.active,
        currency: price.currency,
        unit_amount: price.unit_amount,
        product: price.product,
        type: price.type,
      }
    });
  } catch (error: any) {
    console.error('Error verifying price:', error);
    
    return NextResponse.json(
      { 
        exists: false,
        error: error.message 
      },
      { status: error.statusCode || 500 }
    );
  }
} 