"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function AboutPageClient() {
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
        <nav className="flex items-center">
          <ul className="flex items-center space-x-6 text-sm font-medium text-white/80">
            <li className="flex items-center"><Link href="/about" className="text-white transition-colors">About</Link></li>
            <li className="flex items-center"><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li className="flex items-center">
              <Link 
                href="/login" 
                className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors flex items-center"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      {/* Main content with centered card */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full shadow-xl border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6">About rec.ai</h1>
          
          <div className="space-y-4 text-white/90">
            <p>
              rec.ai is a cutting-edge platform designed to transform how you capture, transcribe, and analyze audio content.
            </p>
            
            <p>
              Our mission is to make audio processing accessible, accurate, and insightful. Whether you&apos;re a student recording lectures, 
              a professional documenting meetings, or a content creator capturing ideas, rec.ai provides the tools you need to turn 
              spoken words into actionable text and insights.
            </p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Key Features</h2>
            
            <ul className="list-disc pl-5 space-y-2">
              <li>AI-Powered Transcription with industry-leading accuracy, multi-speaker detection, and time-stamped references</li>
              <li>Smart Content Analysis that automatically summarizes content and extracts valuable insights using custom analysis workflows</li>
              <li>Secure & Accessible with end-to-end encryption, cloud storage across all devices, and flexible sharing options</li>
              <li>Personalized Experience featuring an intuitive interface with customizable themes and organization tools</li>
              <li>High-quality audio recording with advanced noise reduction technology</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Value-Based Pricing</h2>
            
            <p>
              For a limited time only, we offer a Free Tier with essential capabilities, and a Lifetime Supporter option—a one-time payment for unlimited 
              access to all features without recurring subscription fees.
            </p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Perfect For</h2>
            
            <p>
              rec.ai serves diverse professionals: students capturing lectures, business teams documenting meetings, 
              journalists transcribing interviews, content creators transforming ideas, and researchers analyzing qualitative data.
            </p>
            
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">Our Team</h2>
            
            <p>
              rec.ai was founded by a team of audio engineers, AI specialists, and UX designers passionate about 
              creating tools that enhance productivity and creativity through audio processing.
            </p>
            
            <div className="mt-8 pt-6 border-t border-white/20">
              <Link 
                href="/" 
                className="inline-flex items-center text-pink-300 hover:text-pink-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 