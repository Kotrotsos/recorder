/**
 * API Client for handling transcription and AI requests
 */

import { createClient } from '@/lib/supabase';

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

/**
 * Interface for AI processing results
 */
export interface AIProcessingResult {
  success: boolean;
  result?: string;
  error?: string;
  title?: string;
  content?: string;
}

/**
 * Extract title and content from XML formatted response
 * @param text The XML formatted response
 * @returns Object with title and content
 */
function extractFromXML(text: string): { title: string; content: string } {
  let title = '';
  let content = '';

  // Extract title
  const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  // Extract content
  const contentMatch = text.match(/<content>([\s\S]*?)<\/content>/);
  if (contentMatch && contentMatch[1]) {
    content = contentMatch[1].trim();
  }

  return { title, content };
}

/**
 * Send text for summarization
 * @param text The text to summarize
 * @returns The summarization result
 */
export async function summarizeText(text: string): Promise<AIProcessingResult> {
  try {
    console.log("API Client: Preparing to summarize text of length:", text.length);

    // Call our API endpoint with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ text }),
        signal: controller.signal
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

      // Extract title and content from XML
      const { title, content } = extractFromXML(result.result);

      return {
        success: true,
        result: result.result,
        title,
        content
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("API Client: Request timed out");
        return {
          success: false,
          error: 'Summarization request timed out. The text might be too long or the server is busy.'
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

/**
 * Send text for analysis
 * @param text The text to analyze
 * @returns The analysis result
 */
export async function analyzeText(text: string): Promise<AIProcessingResult> {
  try {
    console.log("API Client: Preparing to analyze text of length:", text.length);

    // Call our API endpoint with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ text }),
        signal: controller.signal
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

      // Extract title and content from XML
      const { title, content } = extractFromXML(result.result);

      return {
        success: true,
        result: result.result,
        title,
        content
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("API Client: Request timed out");
        return {
          success: false,
          error: 'Analysis request timed out. The text might be too long or the server is busy.'
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

/**
 * Send text for translation
 * @param text The text to translate
 * @param language The target language
 * @returns The translation result
 */
export async function translateText(text: string, language: string): Promise<AIProcessingResult> {
  try {
    console.log(`API Client: Preparing to translate text of length ${text.length} to ${language}`);

    // Call our API endpoint with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      console.log("API Client: Sending translation request to API");
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ text, language }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log("API Client: Response received", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      const result = await response.json();
      console.log("API Client: Parsed response", result);

      if (!response.ok) {
        console.error("API Client: Translation request failed", {
          status: response.status,
          statusText: response.statusText,
          error: result.error
        });
        return {
          success: false,
          error: result.error || `Server returned ${response.status}`
        };
      }

      console.log("API Client: Translation successful");
      return {
        success: true,
        result: result.result,
        content: result.result
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("API Client: Request timed out");
        return {
          success: false,
          error: 'Translation request timed out. The text might be too long or the server is busy.'
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

/**
 * Process transcript with different processing types
 * @param text The transcript text to process
 * @param processingType The type of processing to apply (keep-as-is, condense, expand)
 * @returns The processed transcript
 */
export async function processTranscript(text: string, processingType: 'keep-as-is' | 'condense' | 'expand'): Promise<AIProcessingResult> {
  try {
    console.log("API Client: Preparing to process transcript of length:", text.length, "with type:", processingType);

    // Call our API endpoint with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      const response = await fetch('/api/ai/process-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ text, processingType }),
        signal: controller.signal
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
        result: result.result,
        // No need to extract title/content since this just returns processed text
        content: result.result
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("API Client: Request timed out");
        return {
          success: false,
          error: 'Transcript processing request timed out. The text might be too long or the server is busy.'
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

/**
 * Process a transcript with a custom prompt
 * @param transcript The transcript to process
 * @param promptId The ID of the custom prompt to use
 * @returns The processed content and title
 */
export async function processWithCustomPrompt(transcript: string, promptId: string) {
  try {
    // Get the auth token from Supabase client for authentication
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;
    
    if (!authToken) {
      throw new Error("Not authenticated. Please log in to use custom prompts.");
    }
    
    console.log(`Processing transcript with custom prompt ID: ${promptId}`);
    console.log(`Prompt ID length: ${promptId.length}`);
    console.log(`First 8 chars: ${promptId.substring(0, 8)}, Last 8 chars: ${promptId.substring(promptId.length - 8)}`);
    
    // Get the current origin for API requests to ensure correct port
    const apiBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const apiUrl = `${apiBaseUrl}/api/ai/process-custom-prompt`;
    
    console.log(`Using API URL: ${apiUrl}`);
    
    // Use AbortController to set a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcript, 
          promptId,
          authToken // Include auth token for authentication
        }),
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Log the response status for debugging
      console.log(`Custom prompt processing response status: ${response.status}`);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          // Try to parse as JSON for structured error
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, use the raw text if available
          if (errorText) errorMessage = errorText;
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse response data
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      return {
        success: true,
        content: data.content,
        title: data.title
      };
    } catch (innerError: any) {
      clearTimeout(timeoutId);
      
      // Handle AbortController abort() error
      if (innerError.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw innerError;
    }
  } catch (error: any) {
    console.error('Error processing with custom prompt:', error);
    throw error;
  }
} 