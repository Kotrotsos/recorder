import { createClient } from './supabase-server';
import { Database } from '@/types/database.types';
import { sendWebhookNotification } from './webhook';

/**
 * Database utility functions for interacting with Supabase
 */

// Files
export async function uploadFile(userId: string, file: File) {
  const supabase = createClient();
  
  // Upload file to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  const { data: storageData, error: storageError } = await supabase.storage
    .from('audio-files')
    .upload(filePath, file);
  
  if (storageError) {
    throw new Error(`Error uploading file: ${storageError.message}`);
  }
  
  // Create file record in database
  const { data: fileData, error: fileError } = await supabase
    .from('files')
    .insert({
      user_id: userId,
      filename: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type
    })
    .select()
    .single();
  
  if (fileError) {
    // If there was an error creating the file record, delete the uploaded file
    await supabase.storage.from('audio-files').remove([filePath]);
    throw new Error(`Error creating file record: ${fileError.message}`);
  }
  
  return fileData;
}

export async function getUserFiles(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Error fetching files: ${error.message}`);
  }
  
  return data || [];
}

export async function deleteFile(userId: string, fileId: string) {
  const supabase = createClient();
  
  // Get file path first
  const { data: fileData, error: fetchError } = await supabase
    .from('files')
    .select('file_path')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    throw new Error(`Error fetching file: ${fetchError.message}`);
  }
  
  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('audio-files')
    .remove([fileData.file_path]);
  
  if (storageError) {
    throw new Error(`Error deleting file from storage: ${storageError.message}`);
  }
  
  // Delete file record from database
  const { error: deleteError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', userId);
  
  if (deleteError) {
    throw new Error(`Error deleting file record: ${deleteError.message}`);
  }
  
  return true;
}

// Transcriptions
export async function createTranscription(userId: string, fileId: string, title: string, content: string, duration?: number, metadata?: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('transcriptions')
    .insert({
      user_id: userId,
      file_id: fileId,
      title,
      content,
      duration,
      metadata
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error creating transcription: ${error.message}`);
  }
  
  // Send webhook notification if configured
  if (data) {
    // Don't await this to avoid blocking the function
    sendWebhookNotification(
      userId,
      'transcription_created',
      data,
      {} // Empty document for transcription_created events
    ).catch(err => console.error('Error sending webhook notification:', err));
  }
  
  return data;
}

export async function getUserTranscriptions(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('transcriptions')
    .select(`
      *,
      files (filename, file_path)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Error fetching transcriptions: ${error.message}`);
  }
  
  return data || [];
}

export async function getTranscription(userId: string, transcriptionId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('transcriptions')
    .select(`
      *,
      files (filename, file_path)
    `)
    .eq('id', transcriptionId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    throw new Error(`Error fetching transcription: ${error.message}`);
  }
  
  return data;
}

export async function updateTranscription(userId: string, transcriptionId: string, updates: Partial<{
  title: string;
  content: string;
  metadata: any;
}>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('transcriptions')
    .update(updates)
    .eq('id', transcriptionId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error updating transcription: ${error.message}`);
  }
  
  return data;
}

export async function deleteTranscription(userId: string, transcriptionId: string) {
  const supabase = createClient();
  
  // Instead of deleting, update the deleted column to true
  const { data, error } = await supabase
    .from('transcriptions')
    .update({ deleted: true })
    .eq('id', transcriptionId)
    .eq('user_id', userId)
    .select();
  
  if (error) {
    throw new Error(`Error soft-deleting transcription: ${error.message}`);
  }
  
  return data;
}

// Analyses
export async function createAnalysis(userId: string, transcriptionId: string | null, title: string, content: string, analysisType: string, metadata?: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      transcription_id: transcriptionId,
      title,
      content,
      analysis_type: analysisType,
      metadata
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error creating analysis: ${error.message}`);
  }
  
  // Send webhook notification if configured
  if (data) {
    // Get the associated transcription if available
    let transcript = {};
    if (transcriptionId) {
      try {
        const { data: transcriptionData } = await supabase
          .from('transcriptions')
          .select('*')
          .eq('id', transcriptionId)
          .single();
        
        if (transcriptionData) {
          transcript = transcriptionData;
        }
      } catch (err) {
        console.error('Error fetching transcription for webhook:', err);
      }
    }
    
    // Don't await this to avoid blocking the function
    sendWebhookNotification(
      userId,
      'analysis_created',
      transcript,
      data
    ).catch(err => console.error('Error sending webhook notification:', err));
  }
  
  return data;
}

export async function getUserAnalyses(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('analyses')
    .select(`
      *,
      transcriptions (title, content)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Error fetching analyses: ${error.message}`);
  }
  
  return data || [];
}

export async function getAnalysesForTranscription(userId: string, transcriptionId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('transcription_id', transcriptionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Error fetching analyses: ${error.message}`);
  }
  
  return data || [];
}

export async function getAnalysis(userId: string, analysisId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('analyses')
    .select(`
      *,
      transcriptions (title, content)
    `)
    .eq('id', analysisId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    throw new Error(`Error fetching analysis: ${error.message}`);
  }
  
  return data;
}

export async function updateAnalysis(userId: string, analysisId: string, updates: Partial<{
  title: string;
  content: string;
  metadata: any;
}>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('analyses')
    .update(updates)
    .eq('id', analysisId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error updating analysis: ${error.message}`);
  }
  
  return data;
}

export async function deleteAnalysis(userId: string, analysisId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', analysisId)
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(`Error deleting analysis: ${error.message}`);
  }
  
  return true;
}

export async function removeTranscriptionReference(userId: string, analysisId: string) {
  const supabase = createClient();
  
  // Use a placeholder UUID instead of null to work around the not-null constraint
  const placeholderUUID = '00000000-0000-0000-0000-000000000000';
  
  const { data, error } = await supabase
    .from('analyses')
    .update({ transcription_id: placeholderUUID })
    .eq('id', analysisId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error removing transcription reference: ${error.message}`);
  }
  
  return data;
}

// Subscriptions
export async function getUserSubscription(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
    throw new Error(`Error fetching subscription: ${error.message}`);
  }
  
  return data || null;
}

export async function createOrUpdateSubscription(userId: string, subscriptionData: {
  plan_id: string;
  status: string;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end?: boolean;
  payment_provider?: string;
  payment_provider_subscription_id?: string;
  metadata?: any;
}) {
  const supabase = createClient();
  
  // Check if user already has a subscription
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .single();
  
  if (existingSubscription) {
    // Update existing subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
    
    return data;
  } else {
    // Create new subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        ...subscriptionData
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating subscription: ${error.message}`);
    }
    
    return data;
  }
}

// User profile
export async function getUserProfile(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw new Error(`Error fetching profile: ${error.message}`);
  }
  
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<{
  full_name: string;
  avatar_url: string;
}>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error updating profile: ${error.message}`);
  }
  
  return data;
}

// Translations
export async function createTranslation(userId: string, originalId: string, originalType: string, language: string, content: string, title?: string, metadata?: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('translations')
    .insert({
      user_id: userId,
      original_id: originalId,
      original_type: originalType,
      language,
      title,
      content,
      metadata
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error creating translation: ${error.message}`);
  }
  
  return data;
}

export async function getTranslation(userId: string, originalId: string, language: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('original_id', originalId)
    .eq('language', language)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    // If no translation found, return null instead of throwing an error
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Error fetching translation: ${error.message}`);
  }
  
  return data;
}

export async function updateTranslation(userId: string, translationId: string, updates: Partial<{
  title: string;
  content: string;
  metadata: any;
}>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('translations')
    .update(updates)
    .eq('id', translationId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error updating translation: ${error.message}`);
  }
  
  return data;
}

export async function deleteTranslation(userId: string, translationId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('translations')
    .delete()
    .eq('id', translationId)
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(`Error deleting translation: ${error.message}`);
  }
  
  return true;
}

// Custom Prompts functions
export async function getCustomPrompts(userId: string) {
  if (!userId) return []
  
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('custom_prompts')
      .select('id, title, prompt_text, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching custom prompts:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getCustomPrompts:', error)
    return []
  }
}

export const getCustomPrompt = async (promptId: string) => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('custom_prompts')
      .select('*')
      .eq('id', promptId)
      .single();
    
    if (error) {
      console.error('Error fetching custom prompt:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCustomPrompt:', error);
    return null;
  }
};

export const createCustomPrompt = async (userId: string, title: string, promptText: string) => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('custom_prompts')
      .insert([
        {
          user_id: userId,
          title,
          prompt_text: promptText
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating custom prompt:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createCustomPrompt:', error);
    return null;
  }
};

export const updateCustomPrompt = async (promptId: string, title: string, promptText: string) => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('custom_prompts')
      .update({
        title,
        prompt_text: promptText,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating custom prompt:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateCustomPrompt:', error);
    return null;
  }
};

export const deleteCustomPrompt = async (promptId: string) => {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('custom_prompts')
      .delete()
      .eq('id', promptId);
    
    if (error) {
      console.error('Error deleting custom prompt:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteCustomPrompt:', error);
    return false;
  }
}; 