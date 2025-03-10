"use client";

import { useState, useEffect } from "react"
import AudioRecorder from "./audio-recorder"
import useAuth from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'

// Create a custom event for communicating with PageContent
const RESULTS_EVENT = 'audioResultsChanged'

export default function AudioWrapper() {
  const [hasResults, setHasResults] = useState(false)
  const [savedResults, setSavedResults] = useState<Array<{ id: number; type: string; content: string; title?: string; generating: boolean; date?: string }>>([])
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { getUserTranscriptions, getUserAnalyses, isLoading, error } = useDatabase()

  // Load user's transcriptions and analyses from the database when authenticated
  useEffect(() => {
    console.log('Auth state changed:', isAuthenticated, 'Loading:', authLoading);
    
    if (isAuthenticated && !authLoading) {
      const loadUserData = async () => {
        try {
          console.log('Loading user data...');
          
          // Load transcriptions
          const transcriptions = await getUserTranscriptions();
          console.log('Loaded transcriptions:', transcriptions.length);
          
          // Load analyses
          const analyses = await getUserAnalyses();
          console.log('Loaded analyses:', analyses.length);
          
          // Convert to the format expected by the AudioRecorder component
          const formattedResults = [
            ...transcriptions.map(t => ({
              id: parseInt(t.id.replace(/-/g, '').substring(0, 13), 16), // Generate a numeric ID from UUID
              type: 'transcribe',
              content: t.content,
              title: t.title,
              generating: false,
              date: new Date(t.created_at).toISOString()
            })),
            ...analyses.map(a => ({
              id: parseInt(a.id.replace(/-/g, '').substring(0, 13), 16), // Generate a numeric ID from UUID
              type: a.analysis_type === 'summary' ? 'summarize' : 'analyze',
              content: a.content,
              title: a.title,
              generating: false,
              date: new Date(a.created_at).toISOString()
            }))
          ];
          
          // Sort by date (newest first)
          formattedResults.sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          console.log('Formatted results:', formattedResults.length);
          
          // Update state
          setSavedResults(formattedResults);
          
          // Update hasResults
          if (formattedResults.length > 0) {
            setHasResults(true);
            // Dispatch event to hide the header
            const event = new CustomEvent(RESULTS_EVENT, { detail: { hasResults: true } });
            window.dispatchEvent(event);
            console.log('Dispatched event with hasResults=true');
          }
        } catch (err) {
          console.error('Error loading user data:', err);
        }
      };
      
      loadUserData();
    }
  }, [isAuthenticated, authLoading, getUserTranscriptions, getUserAnalyses]);

  const handleResultsChange = (results: Array<{ id: number; type: string; content: string; title?: string; generating: boolean; date?: string }>) => {
    // Combine saved results with new results
    const combinedResults = [...savedResults, ...results];
    
    const newHasResults = combinedResults.length > 0;
    setHasResults(newHasResults);
    
    // Dispatch a custom event that PageContent can listen for
    const event = new CustomEvent(RESULTS_EVENT, { detail: { hasResults: newHasResults } });
    window.dispatchEvent(event);
  }

  return (
    <div className="w-full">
      <AudioRecorder 
        isAuthenticated={isAuthenticated} 
        onResultsChange={handleResultsChange}
        initialResults={savedResults}
      />
    </div>
  )
} 