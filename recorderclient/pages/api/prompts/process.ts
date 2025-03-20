import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { OpenAI } from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Create authenticated Supabase client
    const supabase = createServerSupabaseClient({ req, res })
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' })
    }
    
    const { transcript, promptId } = req.body
    
    if (!transcript) {
      return res.status(400).json({ message: 'Missing transcript' })
    }
    
    if (!promptId) {
      return res.status(400).json({ message: 'Missing promptId' })
    }
    
    // Get the custom prompt from the database
    const { data: promptData, error: promptError } = await supabase
      .from('custom_prompts')
      .select('*')
      .eq('id', promptId)
      .eq('user_id', session.user.id)
      .single()
    
    if (promptError || !promptData) {
      return res.status(404).json({ message: 'Custom prompt not found' })
    }
    
    // Process the transcript with OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that processes audio transcripts according to custom prompts.' },
        { role: 'user', content: `${promptData.prompt_text}\n\nHere is the transcript to process:\n\n${transcript}` }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })
    
    // Extract the response content
    const content = response.choices[0]?.message?.content || ''
    
    // Use the custom prompt title as the result title
    const title = promptData.title
    
    return res.status(200).json({
      success: true,
      content,
      title,
    })
  } catch (error) {
    console.error('Error processing custom prompt:', error)
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    })
  }
} 