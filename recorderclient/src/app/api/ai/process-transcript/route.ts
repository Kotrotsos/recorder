import { NextRequest, NextResponse } from 'next/server';
import { openai, openaiConfig } from '@/lib/ai/openai-client';
import { keepAsIsPrompt, condensePrompt, expandPrompt } from '@/lib/ai/prompts';

/**
 * Handle POST requests to the /api/ai/process-transcript endpoint
 */
export async function POST(request: NextRequest) {
  console.log("API Route: Received process-transcript request");
  
  // Check if API key is configured
  if (!openaiConfig.isConfigured || !openai) {
    console.error("API Route: Missing OpenAI API key or client not initialized");
    return NextResponse.json(
      { error: 'OpenAI API key is not configured on the server' },
      { status: 500 }
    );
  }

  try {
    // Parse the JSON from the request
    const { text, processingType } = await request.json();
    
    // Check if text exists
    if (!text) {
      console.error("API Route: No text provided");
      return NextResponse.json(
        { error: 'No text provided for processing' },
        { status: 400 }
      );
    }
    
    // Check if processing type is valid
    if (!processingType || !['keep-as-is', 'condense', 'expand'].includes(processingType)) {
      console.error("API Route: Invalid processing type");
      return NextResponse.json(
        { error: 'Invalid processing type. Must be one of: keep-as-is, condense, expand' },
        { status: 400 }
      );
    }
    
    console.log("API Route: Processing text of length:", text.length, "with type:", processingType);
    
    // Select the appropriate prompt based on the processing type
    let prompt = keepAsIsPrompt; // Default to keep-as-is prompt
    switch (processingType) {
      case 'keep-as-is':
        prompt = keepAsIsPrompt;
        break;
      case 'condense':
        prompt = condensePrompt;
        break;
      case 'expand':
        prompt = expandPrompt;
        break;
    }
    
    try {
      // Create a completion request
      const completion = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text }
        ],
      });
      
      // Check if the completion was successful
      if (!completion || !completion.choices || completion.choices.length === 0) {
        console.error("API Route: Completion completed but no content returned");
        return NextResponse.json(
          { 
            error: 'Completion completed but no content was returned',
            details: 'The service did not return any completion content'
          },
          { status: 500 }
        );
      }
      
      const result = completion.choices[0].message.content;
      
      // Log success
      console.log("API Route: Processing successful");
      console.log("API Route: Result:", result?.substring(0, 100) + (result && result.length > 100 ? '...' : ''));
      
      // Return the processed transcript
      return NextResponse.json({
        success: true,
        result
      });
    } catch (aiError) {
      // Log and return AI errors
      console.error("API Route: OpenAI error", aiError);
      return NextResponse.json(
        {
          error: 'Failed to process with OpenAI',
          details: aiError instanceof Error ? aiError.message : String(aiError)
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