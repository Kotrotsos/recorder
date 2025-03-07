import { Metadata } from 'next';
import PricingPageClient from '@/components/PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing | rec.ai',
  description: 'Simple, transparent pricing for rec.ai - Record, Transcribe, and Analyze'
};

export default function PricingPage() {
  return <PricingPageClient />;
} 