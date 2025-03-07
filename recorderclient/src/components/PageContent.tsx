"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';

// Use dynamic import with SSR disabled for the AudioRecorder component
const AudioRecorder = dynamic(() => import('@/components/audio/audio-wrapper'), {
  ssr: false,
});

export default function PageContent() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      {/* Fancy background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      {/* Navigation bar */}
      <header className="relative z-10 px-6 py-4 flex justify-between items-center">
        <div className="text-white font-bold text-2xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">rec.ai</span>
        </div>
        <nav>
          <ul className="flex space-x-6 text-sm font-medium text-white/80">
            <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
            <li>
              <Link 
                href="#" 
                className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-between relative z-10 px-4">
        {/* Top section with headline */}
        <div className="text-center pt-16 pb-8 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Record, Transcribe, and Analyze
          </h1>
          <p className="text-lg text-white/80">
            Capture your voice with crystal clarity and transform it into actionable insights with our AI-powered tools.
          </p>
        </div>
        
        {/* Bottom section with recorder */}
        <div className="w-full max-w-md mx-auto mb-8">
          <AudioRecorder />
        </div>
      </main>
    </div>
  );
} 