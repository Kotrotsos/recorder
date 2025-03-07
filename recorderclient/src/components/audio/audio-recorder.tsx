"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, Mic, Square, Play, Pause, Save, Trash2, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AudioRecorder() {
  // Basic state
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedAudioURL, setUploadedAudioURL] = useState<string | null>(null)
  const [isUploadedPlaying, setIsUploadedPlaying] = useState(false)
  const [isPostRecording, setIsPostRecording] = useState(false)
  const [selectedAiAction, setSelectedAiAction] = useState<string>("transcribe")
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [currentMimeType, setCurrentMimeType] = useState<string>("")
  
  // Add a state for the transcript
  const [transcriptContent] = useState<string>(
    "This is a simulated transcript of your audio recording. It would contain all the spoken words detected in your recording. In a real implementation, this would be generated by a speech-to-text service.\n\nThe transcript would be formatted with paragraphs and punctuation to make it easy to read. It might also include timestamps or speaker identification depending on the service used.",
  )

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  
  // Visualization state for the recording button
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const visualizationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Stop any active recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop()
        } catch (e) {
          console.error("Error stopping media recorder:", e)
        }
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Clear visualization interval
      if (visualizationIntervalRef.current) {
        clearInterval(visualizationIntervalRef.current)
      }
      
      // Stop microphone stream
      if (micStreamRef.current) {
        try {
          micStreamRef.current.getTracks().forEach(track => {
            try {
              track.stop()
            } catch (e) {
              console.error("Error stopping track:", e)
            }
          })
        } catch (e) {
          console.error("Error stopping stream:", e)
        }
      }
      
      // Clean up audio URLs
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
      
      if (uploadedAudioURL) {
        URL.revokeObjectURL(uploadedAudioURL)
      }
    }
  }, [audioURL, uploadedAudioURL])
  
  // Handle audio ended event
  useEffect(() => {
    const handleAudioEnded = () => {
      setIsPlaying(false)
      setIsUploadedPlaying(false)
    }
    
    const currentAudioRef = audioRef.current;
    
    if (currentAudioRef) {
      currentAudioRef.addEventListener("ended", handleAudioEnded)
    }
    
    return () => {
      if (currentAudioRef) {
        currentAudioRef.removeEventListener("ended", handleAudioEnded)
      }
    }
  }, [])
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }
  
  // Start recording
  const startRecording = async () => {
    try {
      console.log("Starting recording...")
      
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      
      // Store stream reference
      micStreamRef.current = stream
      
      // Reset chunks array
      audioChunksRef.current = []
      
      // Determine the supported MIME type
      const mimeType = getSupportedMimeType();
      console.log("Using MIME type:", mimeType);
      setCurrentMimeType(mimeType);
      
      // Create media recorder with the supported MIME type
      try {
        const options = mimeType ? { mimeType } : undefined;
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        console.log("MediaRecorder created successfully");
      } catch (error) {
        console.error("Error creating MediaRecorder:", error);
        // Try again without specifying a MIME type
        try {
          console.log("Trying to create MediaRecorder without MIME type");
          mediaRecorderRef.current = new MediaRecorder(stream);
          console.log("MediaRecorder created successfully without MIME type");
          // Get the actual MIME type being used
          if (mediaRecorderRef.current.mimeType) {
            setCurrentMimeType(mediaRecorderRef.current.mimeType);
            console.log("Using browser-selected MIME type:", mediaRecorderRef.current.mimeType);
          } else {
            setCurrentMimeType('audio/webm'); // Default fallback
          }
        } catch (fallbackError) {
          console.error("Failed to create MediaRecorder even without MIME type:", fallbackError);
          alert("Your browser doesn't support audio recording. Please try a different browser.");
          // Clean up
          if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
          }
          return;
        }
      }
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log("Data available:", event.data?.size)
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        console.log("MediaRecorder stopped, chunks:", audioChunksRef.current.length)
        if (audioChunksRef.current.length === 0) {
          console.warn("No audio data was recorded")
          return
        }
        
        try {
          // Create blob and URL with the same MIME type
          const blobOptions = currentMimeType ? { type: currentMimeType } : {};
          console.log("Creating audio blob with MIME type:", currentMimeType || "browser default");
          const audioBlob = new Blob(audioChunksRef.current, blobOptions);
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          console.log("Audio blob created successfully");
        } catch (error) {
          console.error("Error creating audio blob:", error);
          // Try with a generic audio type as fallback
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp4' });
            const url = URL.createObjectURL(audioBlob);
            setAudioURL(url);
            setCurrentMimeType('audio/mp4');
            console.log("Created audio blob with fallback MIME type: audio/mp4");
          } catch (fallbackError) {
            console.error("Failed to create audio blob even with fallback:", fallbackError);
            alert("There was an error processing your recording.");
          }
        }
      }
      
      // Start recording
      mediaRecorderRef.current.start(100) // Capture in 100ms chunks
      
      // Update UI state
      setIsRecording(true)
      setRecordingTime(0)
      setIsPostRecording(false)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Start visualization for the recording button
      startVisualization(stream)
      
      console.log("Recording started successfully")
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }
  
  // Start visualization for the recording button
  const startVisualization = (stream: MediaStream) => {
    try {
      // Clear any existing visualization interval
      if (visualizationIntervalRef.current) {
        clearInterval(visualizationIntervalRef.current)
      }
      
      // Create audio context and analyzer
      // Define the AudioContext type that includes webkitAudioContext
      type AudioContextType = typeof AudioContext
      
      // Define a type for the window with webkitAudioContext
      interface WindowWithWebkitAudio extends Window {
        webkitAudioContext?: AudioContextType;
      }
      
      const AudioContextClass: AudioContextType = 
        window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext || null as unknown as AudioContextType;
      
      const audioContext = new AudioContextClass()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.3 // Make it more responsive (lower = more responsive)
      
      // Connect microphone to analyzer
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      // Create data array for frequency data
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      // Update visualization at regular intervals
      visualizationIntervalRef.current = setInterval(() => {
        // Get frequency data
        analyser.getByteFrequencyData(dataArray)
        
        // Calculate average level with emphasis on lower frequencies
        // which are more common in speech
        let sum = 0
        let weight = 0
        for (let i = 0; i < dataArray.length; i++) {
          // Give more weight to lower frequencies (first third of the spectrum)
          const frequencyWeight = i < dataArray.length / 3 ? 3 : 1
          sum += dataArray[i] * frequencyWeight
          weight += frequencyWeight
        }
        const avg = sum / weight
        
        // Update audio level (0-100 scale) with smoother transitions
        // Amplify the effect by multiplying the raw value
        setAudioLevel(prev => {
          // Smooth transitions by blending previous and new values
          const amplifiedLevel = Math.min(100, avg * 1.5) // Amplify by 1.5x
          return prev * 0.2 + amplifiedLevel * 0.8 // 80% new value, 20% old value for more responsiveness
        })
      }, 20) // Update 50 times per second for smoother animation
      
      // Clean up when recording stops
      return () => {
        clearInterval(visualizationIntervalRef.current!)
        audioContext.close()
      }
    } catch (error) {
      console.error("Error starting visualization:", error)
    }
  }
  
  // Get dynamic gradient position based on audio level
  const getGradientPosition = () => {
    // Map audio level (0-100) to gradient position (100%-0%)
    // When audio level is high, gradient moves up (lower percentage)
    // When audio level is low, gradient moves down (higher percentage)
    const position = 100 - audioLevel;
    return `${position}%`
  }
  
  // Get button styles for recording button
  const getRecordingButtonStyles = () => {
    // Fixed size for the button
    const size = '4rem';
    
    // Create a dynamic background with gradient that moves based on audio level
    return {
      width: size,
      height: size,
      background: `linear-gradient(to top, #ef4444 ${getGradientPosition()}, #f87171 100%)`,
      boxShadow: `0 0 ${Math.max(5, audioLevel / 5)}px rgba(239, 68, 68, 0.6)`,
      transition: 'box-shadow 0.1s ease-in-out',
    };
  }
  
  // Get button styles for stop button
  const getStopButtonStyles = () => {
    // Fixed size for the button
    const size = '4rem';
    
    // Create a dynamic background with gradient that moves based on audio level
    return {
      width: size,
      height: size,
      background: `linear-gradient(to top, #b91c1c ${getGradientPosition()}, #ef4444 100%)`,
      boxShadow: `0 0 ${Math.max(5, audioLevel / 5)}px rgba(185, 28, 28, 0.6)`,
      transition: 'box-shadow 0.1s ease-in-out',
    };
  }
  
  // Stop recording
  const stopRecording = () => {
    try {
      console.log("Stopping recording...")
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      // Stop visualization
      if (visualizationIntervalRef.current) {
        clearInterval(visualizationIntervalRef.current)
        visualizationIntervalRef.current = null
      }
      
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      
      // Stop microphone stream
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
        micStreamRef.current = null
      }
      
      // Update UI state
      setIsRecording(false)
      setIsPostRecording(true)
      setAudioLevel(0)
      
      console.log("Recording stopped successfully")
    } catch (error) {
      console.error("Error stopping recording:", error)
      setIsRecording(false)
      setIsPostRecording(true)
    }
  }
  
  // Reset recorder to initial state
  const resetRecorder = () => {
    // Clear previous recording
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
      setAudioURL(null)
    }
    
    // Reset to initial state
    setIsPostRecording(false)
    setIsRecording(false)
    setRecordingTime(0)
    setAiResult(null)
    setIsPlaying(false)
    
    // Stop audio playback if it's playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    setUploadedFile(file)
    
    // Revoke previous URL if exists
    if (uploadedAudioURL) {
      URL.revokeObjectURL(uploadedAudioURL)
    }
    
    // Create a new blob with the supported MIME type if needed
    const supportedMimeType = getSupportedMimeType();
    
    // If the file is already in a supported format, use it directly
    if (file.type.startsWith('audio/') && MediaRecorder.isTypeSupported(file.type)) {
      const url = URL.createObjectURL(file)
      setUploadedAudioURL(url)
      setCurrentMimeType(file.type);
    } else {
      // Otherwise, create a new blob with a supported type
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const mimeType = supportedMimeType || 'audio/mp4';
          const blob = new Blob([e.target.result], { type: mimeType });
          const url = URL.createObjectURL(blob);
          setUploadedAudioURL(url);
          setCurrentMimeType(mimeType);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }
  
  // Toggle play recorded audio
  const togglePlayRecorded = () => {
    if (audioRef.current && audioURL) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.src = audioURL
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  // Toggle play uploaded audio
  const togglePlayUploaded = () => {
    if (audioRef.current && uploadedAudioURL) {
      if (isUploadedPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.src = uploadedAudioURL
        audioRef.current.play()
      }
      setIsUploadedPlaying(!isUploadedPlaying)
    }
  }
  
  // Process with AI
  const processWithAI = () => {
    setAiProcessing(true)
    
    // Simulate AI processing
    setTimeout(() => {
      let result = ""
      
      if (selectedAiAction === "transcribe") {
        result = transcriptContent
      } else if (selectedAiAction === "summarize") {
        result = "This is a summary of the audio recording. It would contain the key points and main ideas expressed in the recording. In a real implementation, this would be generated by an AI service that analyzes the content of the recording."
      } else if (selectedAiAction === "analyze") {
        result = "This is an analysis of the audio recording. It would contain insights, sentiment analysis, and other analytical information about the content. In a real implementation, this would be generated by an AI service that performs deep analysis of the recording."
      }
      
      setAiResult(result)
      setAiProcessing(false)
    }, 2000) // Simulate 2 second processing time
  }

  // Helper function to determine the supported MIME type
  const getSupportedMimeType = () => {
    // Safari-friendly formats first
    const types = [
      'audio/mp4',
      'audio/aac',
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Browser supports recording in ${type} format`);
        return type;
      }
    }
    
    console.warn('No supported MIME types found for MediaRecorder. Using default browser implementation.');
    // Fallback to default (browser will choose)
    return '';
  };

  // Helper function to get file extension from MIME type
  const getFileExtensionFromMimeType = (mimeType: string): string => {
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('wav')) return 'wav';
    if (mimeType.includes('aac')) return 'aac';
    return 'audio'; // Default fallback
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-white/10 backdrop-blur-md border-0 shadow-xl">
      <CardContent className="p-5">
        <Tabs defaultValue="record" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 p-1 rounded-lg">
            <TabsTrigger
              value="record"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md text-white/70"
            >
              Record
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md text-white/70"
            >
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-5">
            {/* Recording controls */}
            <div className="space-y-4">
              {/* Timer display - only show when recording or after recording */}
              {(isRecording || isPostRecording) && (
                <div className="text-center">
                  <span className="text-3xl font-mono font-bold text-white">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}

              {/* Control buttons */}
              <div className="flex justify-center gap-4">
                {isRecording ? (
                  <Button
                    variant="destructive"
                    style={getStopButtonStyles()}
                    className="rounded-full p-0 flex items-center justify-center"
                    onClick={stopRecording}
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                ) : isPostRecording ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-12 h-12 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      onClick={resetRecorder}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-12 h-12 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      onClick={togglePlayRecorded}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-12 h-12 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      onClick={resetRecorder}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Button
                      variant="default"
                      style={getRecordingButtonStyles()}
                      className="rounded-full p-0 flex items-center justify-center mb-2"
                      onClick={startRecording}
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                    <span className="text-xs text-white/60">Tap to record</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Processing section - only show after recording */}
            {isPostRecording && audioURL && (
              <div className="space-y-4 mt-6 pt-6 border-t border-white/20">
                <Select
                  value={selectedAiAction}
                  onValueChange={setSelectedAiAction}
                >
                  <SelectTrigger className="w-full h-12 text-white text-base bg-white/10 border-white/20 focus:ring-white/30">
                    <SelectValue placeholder="Select AI action" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="transcribe" className="text-base focus:bg-white/10 focus:text-white">Transcribe</SelectItem>
                    <SelectItem value="summarize" className="text-base focus:bg-white/10 focus:text-white">Summarize</SelectItem>
                    <SelectItem value="analyze" className="text-base focus:bg-white/10 focus:text-white">Analyze</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="default"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 text-base"
                  disabled={aiProcessing}
                  onClick={processWithAI}
                >
                  {aiProcessing ? "Processing..." : `${selectedAiAction.charAt(0).toUpperCase() + selectedAiAction.slice(1)} Audio`}
                </Button>

                {aiResult && (
                  <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20 text-sm text-white/90">
                    <h4 className="font-medium mb-2 text-white">
                      {selectedAiAction === "transcribe"
                        ? "Transcript"
                        : selectedAiAction === "summarize"
                        ? "Summary"
                        : "Analysis"}
                    </h4>
                    <div className="whitespace-pre-line">{aiResult}</div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-5">
            {!uploadedFile ? (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-lg bg-white/5">
                <Upload className="h-8 w-8 text-white/50 mb-2" />
                <p className="text-sm text-white/70 mb-4 text-center">
                  Upload an audio file to process with AI
                </p>
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="audio-upload"
                  className="inline-flex items-center justify-center px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-md hover:bg-white/30 cursor-pointer transition-colors"
                >
                  Select Audio File
                </label>
              </div>
            ) : (
              <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-white">{uploadedFile.name}</h3>
                    <p className="text-xs text-white/60">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={togglePlayUploaded}
                  >
                    {isUploadedPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="space-y-4">
                  <Select
                    value={selectedAiAction}
                    onValueChange={setSelectedAiAction}
                  >
                    <SelectTrigger className="w-full h-12 text-white text-base bg-white/10 border-white/20 focus:ring-white/30">
                      <SelectValue placeholder="Select AI action" />
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="transcribe" className="text-base focus:bg-white/10 focus:text-white">Transcribe</SelectItem>
                      <SelectItem value="summarize" className="text-base focus:bg-white/10 focus:text-white">Summarize</SelectItem>
                      <SelectItem value="analyze" className="text-base focus:bg-white/10 focus:text-white">Analyze</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="default"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 text-base"
                    disabled={aiProcessing}
                    onClick={processWithAI}
                  >
                    {aiProcessing ? "Processing..." : `${selectedAiAction.charAt(0).toUpperCase() + selectedAiAction.slice(1)} Audio`}
                  </Button>

                  {aiResult && (
                    <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20 text-sm text-white/90">
                      <h4 className="font-medium mb-2 text-white">
                        {selectedAiAction === "transcribe"
                          ? "Transcript"
                          : selectedAiAction === "summarize"
                          ? "Summary"
                          : "Analysis"}
                      </h4>
                      <div className="whitespace-pre-line">{aiResult}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      {/* Only show footer with save button after recording */}
      {isPostRecording && audioURL && (
        <CardFooter className="px-5 py-3 border-t border-white/20 bg-white/5 text-xs text-white/60">
          <audio ref={audioRef} className="hidden" />
          <div className="w-full flex justify-between items-center">
            <span>Audio Recorder</span>
            <a
              href="#"
              className="text-white/80 hover:text-white hover:underline transition-colors"
              onClick={(e) => {
                e.preventDefault()
                if (audioURL) {
                  const a = document.createElement("a")
                  a.href = audioURL
                  const extension = getFileExtensionFromMimeType(currentMimeType);
                  a.download = `recording.${extension}`
                  a.click()
                }
              }}
            >
              <Save className="h-4 w-4 inline-block mr-1" />
              Save Recording
            </a>
          </div>
        </CardFooter>
      )}
      {/* Always have the audio element available but hidden */}
      {!isPostRecording && <audio ref={audioRef} className="hidden" />}
    </Card>
  )
}

