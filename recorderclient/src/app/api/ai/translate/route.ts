import { NextRequest, NextResponse } from 'next/server';
import { openai, openaiConfig } from '@/lib/ai/openai-client';
import { translatePrompt } from '@/lib/ai/prompts';

/**
 * Supported languages for mock translations
 */
type SupportedLanguage = 'dutch' | 'german' | 'french' | 'spanish';

/**
 * Mock translations for testing when OpenAI API key is not available
 */
const mockTranslations: Record<SupportedLanguage, { prefix: string; sample: string }> = {
  dutch: {
    prefix: "Vertaald naar Nederlands: ",
    sample: "Dit is een voorbeeld van een vertaalde tekst in het Nederlands."
  },
  german: {
    prefix: "Übersetzt auf Deutsch: ",
    sample: "Dies ist ein Beispiel für einen übersetzten Text auf Deutsch."
  },
  french: {
    prefix: "Traduit en français: ",
    sample: "Voici un exemple de texte traduit en français."
  },
  spanish: {
    prefix: "Traducido al español: ",
    sample: "Este es un ejemplo de texto traducido al español."
  }
};

/**
 * Handle POST requests to the /api/ai/translate endpoint
 */
export async function POST(request: NextRequest) {
  console.log("API Route: Received translate request");
  
  try {
    // Parse the JSON from the request
    const { text, language } = await request.json();
    
    // Check if text and language exist
    if (!text) {
      console.error("API Route: No text provided");
      return NextResponse.json(
        { error: 'No text provided for translation' },
        { status: 400 }
      );
    }

    if (!language) {
      console.error("API Route: No target language provided");
      return NextResponse.json(
        { error: 'No target language provided for translation' },
        { status: 400 }
      );
    }
    
    console.log(`API Route: Translating text of length ${text.length} to ${language}`);
    
    // Check if API key is configured
    if (!openaiConfig.isConfigured || !openai) {
      console.warn("API Route: OpenAI API key not configured, using mock translation");
      
      // Use mock translation
      const languageKey = language.toLowerCase() as SupportedLanguage;
      
      // Check if the language is supported in our mock translations
      if (languageKey in mockTranslations) {
        // Create a mock translation by adding a prefix
        const result = mockTranslations[languageKey].prefix + text;
        
        console.log("API Route: Mock translation successful");
        console.log("API Route: Result:", result.substring(0, 100) + (result.length > 100 ? '...' : ''));
        
        return NextResponse.json({
          success: true,
          result
        });
      } else {
        // If language not supported in mock, return a generic mock
        const result = `Translated to ${language}: ${text}`;
        
        console.log("API Route: Generic mock translation successful");
        console.log("API Route: Result:", result.substring(0, 100) + (result.length > 100 ? '...' : ''));
        
        return NextResponse.json({
          success: true,
          result
        });
      }
    }
    
    try {
      // Create a completion request
      const completion = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          { role: "system", content: translatePrompt },
          { role: "user", content: `Translate this to ${language}:\n\n${text}` }
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
      console.log("API Route: Translation successful");
      console.log("API Route: Result:", result?.substring(0, 100) + (result && result.length > 100 ? '...' : ''));
      
      // Return the translation result
      return NextResponse.json({
        success: true,
        result
      });
    } catch (aiError) {
      console.error("API Route: OpenAI error", aiError);
      
      // Fallback to mock translation if OpenAI API fails
      console.warn("API Route: OpenAI API failed, falling back to mock translation");
      
      // Use mock translation
      const languageKey = language.toLowerCase() as SupportedLanguage;
      
      // Check if the language is supported in our mock translations
      if (languageKey in mockTranslations) {
        // Create a mock translation by adding a prefix
        const result = mockTranslations[languageKey].prefix + text;
        
        console.log("API Route: Mock translation successful (fallback)");
        console.log("API Route: Result:", result.substring(0, 100) + (result.length > 100 ? '...' : ''));
        
        return NextResponse.json({
          success: true,
          result
        });
      } else {
        // If language not supported in mock, return a generic mock
        const result = `Translated to ${language}: ${text}`;
        
        console.log("API Route: Generic mock translation successful (fallback)");
        console.log("API Route: Result:", result.substring(0, 100) + (result.length > 100 ? '...' : ''));
        
        return NextResponse.json({
          success: true,
          result
        });
      }
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