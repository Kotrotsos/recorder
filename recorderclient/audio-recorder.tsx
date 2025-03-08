import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { transcribeAudio } from "@/lib/api-client"

// ... existing code ...
      mediaRecorder.onstop = async () => {
        try {
          console.log("MediaRecorder stopped, chunks:", audioChunksRef.current.length)
          
          if (audioChunksRef.current.length === 0) {
            console.error("No audio data available")
            return
          }

          const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm"
          console.log("Creating audio blob with MIME type:", mimeType)
          
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
          console.log("Audio blob created successfully")
          
          const url = URL.createObjectURL(audioBlob)
          setAudioURL(url)
          
          // Set up audio player
          if (audioRef.current) {
            audioRef.current.src = url
            audioRef.current.load()
          }
          
          console.log("Recording stopped successfully")

          // Automatically start transcription
          console.log("=== STARTING AUTOMATIC TRANSCRIPTION ===")
          setSelectedAiAction("transcribe")
          // Important: Set processing state before the await to ensure UI updates
          setAiProcessing(true)
          setAiResult(null)

          // Force a small delay to ensure state updates happen before the potentially
          // long-running operation
          await new Promise(resolve => setTimeout(resolve, 100))

          try {
            console.log("Starting transcription with audio blob:", {
              type: audioBlob.type,
              size: audioBlob.size
            })
            
            // Use our dedicated API client to handle the transcription
            const result = await transcribeAudio(audioBlob)
            
            if (result.success && result.text) {
              console.log("Transcription successful:", result.text.substring(0, 100) + (result.text.length > 100 ? '...' : ''))
              setAiResult(result.text)
              setTranscriptContent(result.text)
            } else {
              throw new Error(result.error || 'Unknown transcription error')
            }
          } catch (error) {
            console.error("Auto-transcription error:", error)
            setAiResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
          } finally {
            setAiProcessing(false)
          }
        } catch (error) {
          console.error("Error processing audio:", error)
        }
      }
// ... existing code ... 