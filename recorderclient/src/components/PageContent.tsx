"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import useAuth from '@/hooks/useAuth';

// Use dynamic import with SSR disabled for the AudioRecorder component
const AudioRecorderWrapper = dynamic(() => import('@/components/audio/audio-wrapper'), {
  ssr: false,
});

interface PageContentProps {
  user: User | null;
}

export default function PageContent({ user: serverUser }: PageContentProps) {
  // Use the useAuth hook for client-side auth state
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Add state to track if there are processed results
  const [hasProcessedResults, setHasProcessedResults] = useState<boolean>(false);
  
  // Listen for the custom event from AudioWrapper
  useEffect(() => {
    const handleResultsChange = (event: CustomEvent<{ hasResults: boolean }>) => {
      console.log('Received audioResultsChanged event:', event.detail);
      setHasProcessedResults(event.detail.hasResults);
    };
    
    // Add event listener
    window.addEventListener('audioResultsChanged', handleResultsChange as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('audioResultsChanged', handleResultsChange as EventListener);
    };
  }, []);

  // Log authentication state for debugging
  useEffect(() => {
    console.log('PageContent - Auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    console.log('PageContent - Auth loading:', authLoading ? 'Loading' : 'Not loading');
    console.log('PageContent - Has results:', hasProcessedResults ? 'Yes' : 'No');
  }, [isAuthenticated, authLoading, hasProcessedResults]);

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
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 animated-gradient overflow-y-auto overflow-x-hidden">
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
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">rec.ai</span>
        </div>
        <nav>
          <ul className="flex space-x-6 text-sm font-medium text-white/80">
            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li>
              {isAuthenticated ? (
                <Link 
                  href="/account" 
                  className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  My Account
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-between relative z-10 px-4">
        {/* Top section with headline - only show when no results */}
        {!hasProcessedResults && (
          <div className="text-center pt-16 pb-8 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Record, Transcribe, and Analyze
            </h1>
            <p className="text-lg text-white/80">
              Capture your voice with crystal clarity and transform it into actionable insights with our AI-powered tools.
            </p>
          </div>
        )}
        
        {/* Bottom section with recorder */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <AudioRecorderWrapper />
        </div>
      </main>
    </div>
  );
} 