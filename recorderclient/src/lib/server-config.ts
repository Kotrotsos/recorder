/**
 * Server-side configuration
 * This file should only be imported in server components or API routes
 */

// Log when this module is loaded
console.log("Server Config: Loading server configuration");

// Get the AssemblyAI API key from environment variables
export const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY;

// Log API key availability (safely)
console.log("Server Config: AssemblyAI API key available:", !!ASSEMBLY_AI_API_KEY);

// Validate the configuration
if (!ASSEMBLY_AI_API_KEY) {
  console.warn("Server Config: WARNING - AssemblyAI API key is not configured!");
}

// Export the configuration
export const serverConfig = {
  assemblyAi: {
    apiKey: ASSEMBLY_AI_API_KEY,
    isConfigured: !!ASSEMBLY_AI_API_KEY
  }
};

// Log that configuration is loaded
console.log("Server Config: Server configuration loaded successfully"); 