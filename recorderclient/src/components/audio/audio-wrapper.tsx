"use client";

import dynamic from 'next/dynamic';
import useAuth from '@/hooks/useAuth';

// Use dynamic import with SSR disabled for the AudioRecorder component
// since it uses browser APIs that aren't available during server-side rendering
const AudioRecorder = dynamic(() => import('@/components/audio/audio-recorder'), {
  ssr: false,
});

export default function AudioWrapper() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="w-full">
      <AudioRecorder isAuthenticated={isAuthenticated} />
    </div>
  );
} 