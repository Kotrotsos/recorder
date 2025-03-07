"use client"

import Link from 'next/link'
import TermsLayout from '@/components/auth/terms-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export default function TermsOfServicePage() {
  return (
    <TermsLayout title="Terms of Service" description="Please read our terms carefully">
      <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="prose prose-invert max-w-none max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
            <p className="text-white/80 mb-6 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">1. Introduction</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Welcome to rec.ai ("we," "our," or "us"). By accessing or using our audio recording and transcription services, 
              you agree to be bound by these Terms of Service ("Terms"). Please read these Terms carefully.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">2. Account Registration</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              To use our services, you must register for an account. You agree to provide accurate, current, and complete 
              information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">3. Privacy Policy</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Your privacy is important to us. Our Privacy Policy describes how we collect, use, and share your personal information. 
              By using our services, you agree to our collection, use, and sharing of your information as described in our Privacy Policy.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">4. User Content</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              You retain all rights to the audio content you upload to our service. However, by uploading content, you grant us a 
              non-exclusive, worldwide, royalty-free license to use, reproduce, and process your content solely for the purpose of 
              providing our services to you.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">5. Prohibited Uses</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              You agree not to use our services to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-white/80 text-lg leading-relaxed">
              <li className="mb-2">Violate any applicable laws or regulations</li>
              <li className="mb-2">Infringe upon the rights of others</li>
              <li className="mb-2">Upload or share content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
              <li className="mb-2">Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li className="mb-2">Interfere with or disrupt the integrity or performance of our services</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">6. Termination</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              We reserve the right to suspend or terminate your account and access to our services at any time for violations of these Terms 
              or for any other reason at our sole discretion.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">7. Changes to Terms</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              We may modify these Terms at any time. If we make changes, we will provide notice by posting the updated Terms on our website. 
              Your continued use of our services after such notice constitutes your acceptance of the modified Terms.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">8. Limitation of Liability</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, 
              goodwill, or other intangible losses resulting from your use of our services.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">9. Contact Us</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              If you have any questions about these Terms, please contact us at support@rec.ai.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/10 pt-6 pb-6">
          <Button 
            asChild
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <Link href="/register">
              Return to Registration
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </TermsLayout>
  )
} 