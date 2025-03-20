import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase';

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add these export configurations to disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not configured",
      }, { status: 500 });
    }
    
    // Extract data from request body
    const body = await request.json();
    const { transcript, promptId, authToken } = body;
    
    // Validate input
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({
        success: false,
        error: "No transcript provided or invalid format",
      }, { status: 400 });
    }

    if (!promptId) {
      return NextResponse.json({
        success: false,
        error: "No prompt ID provided",
      }, { status: 400 });
    }

    if (!authToken) {
      return NextResponse.json({
        success: false,
        error: "Authentication required. Please provide a valid auth token.",
      }, { status: 401 });
    }

    // Create client and authenticate with token
    const supabase = createClient();
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);
    
    if (userError || !user) {
      console.error("Error authenticating user:", userError);
      return NextResponse.json({
        success: false,
        error: "Authentication failed. Please log in again.",
      }, { status: 401 });
    }
    
    const userId = user.id;
    console.log("Authenticated user ID from token:", userId);
    console.log("Looking for prompt with ID:", promptId);

    // Directly fetch prompt from database with better error handling
    console.log("Executing database query for promptId:", promptId);
    console.log("promptId length:", promptId.length);
    console.log("promptId trimmed:", promptId.trim());

    // Try first with eq operator
    const { data, error } = await supabase
      .from('custom_prompts')
      .select('*')
      .eq('id', promptId);

    console.log("Query result:", { 
      hasData: !!data, 
      dataLength: data?.length || 0, 
      hasError: !!error 
    });

    // If not found, try with a more flexible like query as fallback
    if (!data || data.length === 0) {
      console.log("First query found no results, trying with ilike");
      
      // Try with ilike for case insensitive matching
      const { data: dataLike, error: errorLike } = await supabase
        .from('custom_prompts')
        .select('*')
        .ilike('id', promptId);
        
      console.log("ILIKE query result:", { 
        hasData: !!dataLike, 
        dataLength: dataLike?.length || 0, 
        hasError: !!errorLike 
      });
      
      // If the ilike query found results, use them
      if (dataLike && dataLike.length > 0) {
        console.log("Found prompt with ilike query:", dataLike[0].id);
        // Use the data from the ilike query instead
        return processPrompt(dataLike[0], userId, transcript);
      }
      
      // If still not found, try to get all custom prompts for this user
      console.log("Fetching all custom prompts for user:", userId);
      
      // Get all prompts for this user
      const { data: userPrompts, error: userPromptsError } = await supabase
        .from('custom_prompts')
        .select('*')
        .eq('user_id', userId);
        
      console.log("User has prompts:", userPrompts?.length || 0);
      
      if (userPrompts && userPrompts.length > 0) {
        console.log("User prompts:", userPrompts.map(p => ({ id: p.id, title: p.title })));
        
        // Check if any prompt ID is similar (case insensitive)
        const matchingPrompt = userPrompts.find(p => 
          p.id.toLowerCase() === promptId.toLowerCase() ||
          p.id.replace(/-/g, '') === promptId.replace(/-/g, '')
        );
        
        if (matchingPrompt) {
          console.log("Found matching prompt with different casing or format:", matchingPrompt.id);
          return processPrompt(matchingPrompt, userId, transcript);
        }

        // Final fallback: Check if user meant to use a prompt by title
        console.log("Checking if prompt title matches:", promptId);
        
        // See if any prompt title matches the provided ID (user might have confused ID with title)
        const titleMatch = userPrompts.find(p => 
          p.title.toLowerCase() === promptId.toLowerCase() || 
          p.title.toLowerCase().includes(promptId.toLowerCase())
        );
        
        if (titleMatch) {
          console.log("Found prompt with matching title instead of ID:", titleMatch.title);
          return processPrompt(titleMatch, userId, transcript);
        }
        
        // If all else fails, just use the first prompt as last resort
        console.log("No matching prompts found. Using first available prompt as fallback.");
        return processPrompt(userPrompts[0], userId, transcript);
      }

      console.error(`No prompt found with ID: ${promptId}`);
      return NextResponse.json({
        success: false,
        error: "Custom prompt not found",
      }, { status: 404 });
    }

    // Helper function to process the prompt once found
    async function processPrompt(
      customPrompt: { id: string; user_id: string; title: string; prompt_text: string }, 
      userId: string, 
      transcript: string
    ) {
      // Prompt found, but check if it belongs to the user
      console.log("Found prompt:", customPrompt.title, "belonging to user:", customPrompt.user_id);
      
      if (customPrompt.user_id !== userId) {
        console.error(`Prompt belongs to user ${customPrompt.user_id}, not current user ${userId}`);
        return NextResponse.json({
          success: false,
          error: "You don't have permission to access this prompt",
        }, { status: 403 });
      }

      // All checks passed, process with OpenAI
      console.log("Processing transcript with custom prompt:", customPrompt.title);
      
      // Prepare prompt for OpenAI
      const fullPrompt = `${customPrompt.prompt_text}\n\nTranscript:\n${transcript}`;

      // Process with OpenAI
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant tasked with processing audio transcripts." },
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });

      // Get result content
      const content = completion.choices[0].message?.content?.trim();

      // Return the processed result
      return NextResponse.json({
        success: true,
        content,
        title: customPrompt.title,
      });
    }

    // Process the found prompt
    return processPrompt(data[0], userId, transcript);
  } catch (error: any) {
    console.error('Error processing with custom prompt:', error);
    return NextResponse.json({
      success: false,
      error: error.message || "An error occurred during processing",
    }, { status: 500 });
  }
} 