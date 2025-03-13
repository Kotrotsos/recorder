"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckIcon } from './icons/CheckIcon';

export default function PricingPageClient() {
  // Add a style tag for the animation
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Define the animations
    styleEl.innerHTML = `
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      .animated-gradient {
        background-size: 200% 200%;
        animation: gradientShift 15s ease infinite;
      }
      
      @keyframes float1 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-10px, 10px) scale(1.05); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes float2 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(10px, -10px) scale(1.05); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes float3 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-15px, -5px) scale(1.03); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes float4 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(15px, 5px) scale(1.03); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      .blob1 {
        animation: float1 20s ease-in-out infinite;
      }
      
      .blob2 {
        animation: float2 25s ease-in-out infinite;
      }
      
      .blob3 {
        animation: float3 18s ease-in-out infinite;
      }
      
      .blob4 {
        animation: float4 22s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      
      .pulse-slow {
        animation: pulse 3s ease-in-out infinite;
      }
    `;
    
    // Add the style element to the head
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 animated-gradient">
      {/* Fancy background elements with subtle animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-3xl blob1"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl blob2"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl blob3"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl blob4"></div>
      </div>
      
      {/* Navigation bar */}
      <header className="relative z-10 px-6 py-4 flex justify-between items-center">
        <div className="text-white font-bold text-2xl">
          <Link href="/" className="bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">
            rec.ai
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6 text-sm font-medium text-white/80">
            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="/pricing" className="text-white transition-colors">Pricing</Link></li>
            <li>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We&apos;re just getting started! For a limited time, enjoy all our features completely free or support the development with a lifetime subscription.
          </p>
        </div>
        
        {/* Pricing cards */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 justify-center">
          {/* Free plan */}
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 relative overflow-hidden h-full">
              {/* Limited time badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg pulse-slow">
                  LIMITED TIME OFFER
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Early Access</h2>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">Free</span>
                </div>
                <p className="text-white/70 mt-2">No credit card required</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-pink-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">High-quality audio transcription</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-pink-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Upload existing audio files</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-pink-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">AI-powered content transformation (summaries, key points, action items)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-pink-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Webhook integration for your workflow</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-pink-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Up to 10 hours of audio processing per month</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/register" 
                  className="block w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-xl transition-colors"
                >
                  Get Started Now
                </Link>
                <p className="text-white/60 text-sm mt-4">
                  Paid plans with additional features coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Lifetime Supporter plan */}
          <div className="w-full max-w-sm">
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/30 relative overflow-hidden h-full">
              {/* Special badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold px-4 py-1 rounded-bl-lg pulse-slow">
                  SUPPORTER EXCLUSIVE
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Lifetime Supporter</h2>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">$29.99</span>
                </div>
                <p className="text-white/70 mt-2">One-time payment</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="mb-4 text-white/90 text-sm italic border-l-2 border-amber-400/70 pl-3">
                  <p className="mb-1">These features are currently in development and will be released soon. As a Lifetime Supporter, you'll be the <span className="font-semibold text-amber-300">first to access them</span> when they launch.</p>
                  <p>Your support directly helps an indie developer create amazing tools for everyone. Thank you for making this journey possible!</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-amber-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Everything in Free plan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-amber-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Custom prompt chains</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-amber-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Custom events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-amber-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Advanced automation tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-amber-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Multi-speaker detection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-amber-300 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Support future development</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/register?plan=lifetime" 
                  className="block w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-xl transition-colors"
                >
                  Become a Supporter
                </Link>
                <p className="text-white/60 text-sm mt-4">
                  Support indie development and get early access to all future features
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ section */}
        <div className="mt-16 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">How long will the free plan be available?</h3>
              <p className="text-white/80">
                The free plan will be available during our early access period. We&apos;ll provide advance notice before transitioning to paid plans.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">Are there any limitations to the free plan?</h3>
              <p className="text-white/80">
                Yes, the free plan includes up to 10 hours of audio processing per month. This should be sufficient for most early users.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">What payment methods will you accept when paid plans launch?</h3>
              <p className="text-white/80">
                We&apos;ll accept all major credit cards and potentially other payment methods. We&apos;ll announce full details when paid plans launch.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">What does the Lifetime Supporter plan include?</h3>
              <p className="text-white/80">
                The Lifetime Supporter plan is a one-time payment that gives you lifetime access to all current and future premium features. You&apos;ll be among the first to try new features as they&apos;re developed, and your support directly helps an indie developer continue building and improving this tool. It&apos;s our way of thanking early supporters who believe in what we&apos;re creating.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 