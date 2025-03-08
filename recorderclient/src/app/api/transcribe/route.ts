import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { serverConfig, ASSEMBLY_AI_API_KEY } from '@/lib/server-config';

// Log when the module is loaded
console.log("API Route Module: Initializing transcribe route");

// Log API key availability (safely)
console.log("API Route Module: API key available from server config:", serverConfig.assemblyAi.isConfigured);

// Initialize the AssemblyAI client
const client = ASSEMBLY_AI_API_KEY 
  ? new AssemblyAI({ apiKey: ASSEMBLY_AI_API_KEY }) 
  : null;

// Log client initialization
console.log("API Route Module: AssemblyAI client initialized:", !!client);

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
    responseLimit: false, // No response size limit
  },
};

/**
 * Handle POST requests to the /api/transcribe endpoint
 */
export async function POST(request: NextRequest) {
  console.log("API Route: Received transcription request");
  
  // Check if API key is configured
  if (!serverConfig.assemblyAi.isConfigured || !client) {
    console.error("API Route: Missing API key or client not initialized");
    return NextResponse.json(
      { error: 'AssemblyAI API key is not configured on the server' },
      { status: 500 }
    );
  }

  try {
    // Parse the form data from the request
    console.log("API Route: Parsing form data");
    const formData = await request.formData();
    
    // Get the audio file from the form data
    const audioFile = formData.get('audio');
    
    // Check if the audio file exists and is a File or Blob
    if (!audioFile || !(audioFile instanceof Blob)) {
      console.error("API Route: No valid audio file in request");
      return NextResponse.json(
        { error: 'No valid audio file provided' },
        { status: 400 }
      );
    }
    
    // Log file details
    console.log("API Route: Received audio file", {
      type: audioFile.type,
      size: audioFile.size,
      name: audioFile instanceof File ? audioFile.name : 'blob'
    });
    
    try {
      // Convert the file to an ArrayBuffer
      console.log("API Route: Converting file to ArrayBuffer");
      const arrayBuffer = await audioFile.arrayBuffer();
      
      // Convert the ArrayBuffer to a Buffer
      console.log("API Route: Converting ArrayBuffer to Buffer");
      const buffer = Buffer.from(arrayBuffer);
      console.log("API Route: Buffer created, size:", buffer.length);
      
      // Send the transcription request to AssemblyAI
      console.log("API Route: Sending request to AssemblyAI");
      
      try {
        // Create a transcription request
        const transcript = await client.transcripts.transcribe({
          audio: buffer
        });
        
        // Check if the transcription was successful
        if (!transcript || !transcript.text) {
          console.error("API Route: Transcription completed but no text returned");
          return NextResponse.json(
            { 
              error: 'Transcription completed but no text was returned',
              details: 'The service did not return any transcription text'
            },
            { status: 500 }
          );
        }
        
        // Log success
        console.log("API Route: Transcription successful");
        console.log("API Route: Transcript text:", transcript.text.substring(0, 100) + (transcript.text.length > 100 ? '...' : ''));
        
        // Return the transcription result
        return NextResponse.json({
          success: true,
          text: transcript.text
        });
      } catch (transcriptionError) {
        // Log and return transcription errors
        console.error("API Route: AssemblyAI transcription error", transcriptionError);
        return NextResponse.json(
          {
            error: 'Failed to transcribe with AssemblyAI',
            details: transcriptionError instanceof Error ? transcriptionError.message : String(transcriptionError)
          },
          { status: 500 }
        );
      }
    } catch (processingError) {
      // Log and return file processing errors
      console.error("API Route: Error processing audio file", processingError);
      return NextResponse.json(
        {
          error: 'Failed to process audio file',
          details: processingError instanceof Error ? processingError.message : String(processingError)
        },
        { status: 500 }
      );
    }
  } catch (requestError) {
    // Log and return request parsing errors
    console.error("API Route: Error parsing request", requestError);
    return NextResponse.json(
      {
        error: 'Failed to parse request',
        details: requestError instanceof Error ? requestError.message : String(requestError)
      },
      { status: 400 }
    );
  }
} 