/**
 * OpenAI client configuration
 * This file should only be imported in server components or API routes
 */

import OpenAI from "openai";

// Get the OpenAI API key from environment variables
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Log API key availability (safely)
console.log("OpenAI Config: OpenAI API key available:", !!OPENAI_API_KEY);

// Validate the configuration
if (!OPENAI_API_KEY) {
  console.warn("OpenAI Config: WARNING - OpenAI API key is not configured!");
}

// Create and export the OpenAI client
export const openai = OPENAI_API_KEY 
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

// Export the configuration
export const openaiConfig = {
  apiKey: OPENAI_API_KEY,
  isConfigured: !!OPENAI_API_KEY,
  model: "gpt-4o" // Default model
}; 