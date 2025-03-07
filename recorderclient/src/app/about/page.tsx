import { Metadata } from 'next';
import AboutPageClient from '@/components/AboutPageClient';

export const metadata: Metadata = {
  title: 'About | rec.ai',
  description: 'Learn more about rec.ai - Record, Transcribe, and Analyze'
};

export default function AboutPage() {
  return <AboutPageClient />;
} 