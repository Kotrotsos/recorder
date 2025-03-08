/**
 * API Client for handling transcription requests
 */

/**
 * Send audio for transcription
 * @param audioBlob The audio blob to transcribe
 * @returns The transcription result
 */
export async function transcribeAudio(audioBlob: Blob): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    console.log("API Client: Preparing to transcribe audio", {
      blobType: audioBlob.type,
      blobSize: audioBlob.size
    });

    // Create a FormData object and append the audio file
    const formData = new FormData();
    
    // Make sure we specify the correct file extension and MIME type
    const fileName = `recording.${audioBlob.type.includes('webm') ? 'webm' : 'mp4'}`;
    console.log("API Client: Using filename:", fileName);
    
    formData.append('audio', audioBlob, fileName);

    console.log("API Client: Sending transcription request to API");
    
    // Call our API endpoint with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Explicitly disable caching
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log("API Client: Response received", {
        status: response.status,
        ok: response.ok
      });
      
      const result = await response.json();
      console.log("API Client: Parsed response", result);

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `Server returned ${response.status}`
        };
      }

      return {
        success: true,
        text: result.text
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("API Client: Request timed out");
        return {
          success: false,
          error: 'Transcription request timed out. The audio might be too long or the server is busy.'
        };
      }
      
      console.error("API Client: Fetch error", fetchError);
      return {
        success: false,
        error: fetchError instanceof Error ? fetchError.message : String(fetchError)
      };
    }
  } catch (error) {
    console.error("API Client: Unexpected error", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 