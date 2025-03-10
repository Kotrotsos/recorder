"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/hooks/useDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Use dynamic import with SSR disabled for the AudioRecorder component
const AudioRecorderWrapper = dynamic(() => import('@/components/audio/audio-wrapper'), {
  ssr: false,
});

// Custom event name for communication with AudioRecorderWrapper
const RESULTS_EVENT = 'audioResultsChanged';

// Simple Skeleton component since we don't have the ui/skeleton
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`}></div>
);

interface PageContentProps {
  user: User | null;
}

export default function PageContent({ user: serverUser }: PageContentProps) {
  const [user, setUser] = useState<User | null>(serverUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasProcessedResults, setHasProcessedResults] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userTranscriptions, setUserTranscriptions] = useState<any[]>([]);
  const [userAnalyses, setUserAnalyses] = useState<any[]>([]);
  const router = useRouter();
  const { getUserTranscriptions, getUserAnalyses } = useDatabase();

  // Listen for results change from AudioRecorderWrapper
  const handleResultsChange = (event: CustomEvent<{ hasResults: boolean }>) => {
    setHasProcessedResults(event.detail.hasResults);
  };

  useEffect(() => {
    // Add event listener for results change
    window.addEventListener(RESULTS_EVENT, handleResultsChange as EventListener);
    
    return () => {
      window.removeEventListener(RESULTS_EVENT, handleResultsChange as EventListener);
    };
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      setUser(user);
      setIsAuthenticated(!!user);
      
      // If user is authenticated, load their data
      if (user) {
        loadUserData();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Load user's transcriptions and analyses
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load transcriptions
      const transcriptions = await getUserTranscriptions();
      setUserTranscriptions(transcriptions);
      
      // Load analyses
      const analyses = await getUserAnalyses();
      setUserAnalyses(analyses);
      
      // Set hasProcessedResults to true if user has any transcriptions or analyses
      if (transcriptions.length > 0 || analyses.length > 0) {
        setHasProcessedResults(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-white font-bold text-xl">rec.ai</Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Link href="/about" className="text-white/80 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/pricing" className="text-white/80 hover:text-white transition-colors">
            Pricing
          </Link>
          {isAuthenticated ? (
            <Button variant="outline" onClick={handleSignOut} className="text-white border-white/20 hover:bg-white/10 hover:text-white">
              Sign Out
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-between relative z-10 px-4">
        {/* Top section with headline - only show when no results and not authenticated */}
        {!hasProcessedResults && !isAuthenticated && (
          <div className="text-center pt-16 pb-8 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Record, Transcribe, and Analyze
            </h1>
            <p className="text-lg text-white/80">
              Capture your voice with crystal clarity and transform it into actionable insights with our AI-powered tools.
            </p>
          </div>
        )}
        
        {/* User's previous transcriptions and analyses */}
        {isAuthenticated && (
          <div className="w-full max-w-4xl mx-auto mt-8">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                {userTranscriptions.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Transcriptions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userTranscriptions.map((transcription) => (
                        <Card key={transcription.id} className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-white">{transcription.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-white/80 line-clamp-3">{transcription.content}</p>
                            <p className="text-sm text-white/60 mt-2">
                              {new Date(transcription.created_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {userAnalyses.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Analyses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userAnalyses.map((analysis) => (
                        <Card key={analysis.id} className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-white">{analysis.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-white/80 line-clamp-3">{analysis.content}</p>
                            <p className="text-sm text-white/60 mt-2">
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {userTranscriptions.length === 0 && userAnalyses.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-white/80">You don't have any transcriptions or analyses yet.</p>
                    <p className="text-white/80 mt-2">Start by recording or uploading an audio file below.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Bottom section with recorder */}
        <div className="w-full max-w-md mx-auto mb-8">
          <AudioRecorderWrapper />
        </div>
      </main>
    </div>
  );
} 