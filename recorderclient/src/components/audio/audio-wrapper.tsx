"use client";

import { useState, useEffect } from "react"
import AudioRecorder from "./audio-recorder"
import useAuth from '@/hooks/useAuth'

// Create a custom event for communicating with PageContent
const RESULTS_EVENT = 'audioResultsChanged'

export default function AudioWrapper() {
  const [hasResults, setHasResults] = useState(false)
  const { isAuthenticated } = useAuth()

  const handleResultsChange = (results: Array<{ id: number; type: string; content: string; generating: boolean }>) => {
    const newHasResults = results.length > 0
    setHasResults(newHasResults)
    
    // Dispatch a custom event that PageContent can listen for
    const event = new CustomEvent(RESULTS_EVENT, { detail: { hasResults: newHasResults } })
    window.dispatchEvent(event)
  }

  return (
    <div className="w-full">
      <AudioRecorder isAuthenticated={isAuthenticated} onResultsChange={handleResultsChange} />
    </div>
  )
} 