"use client";

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the AudioRecorder component
// since it uses browser APIs that aren't available during server-side rendering
const AudioRecorder = dynamic(() => import('@/components/audio/audio-recorder'), {
  ssr: false,
});

export default function AudioWrapper() {
  return (
    <div className="w-full">
      <AudioRecorder />
    </div>
  );
} 