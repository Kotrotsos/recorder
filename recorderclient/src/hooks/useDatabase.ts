import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { sendWebhookNotification } from '@/lib/webhook';

/**
 * Custom hook for interacting with the database
 * Provides methods for working with files, transcriptions, analyses, and user data
 */
export function useDatabase() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Reset error state
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to ensure a user profile exists
  const ensureUserProfile = useCallback(async (userId: string) => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') { // No profile found
        // Get user details
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error(`Error getting user: ${userError.message}`);
        }
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Create profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null
          });
        
        if (insertError) {
          throw new Error(`Error creating profile: ${insertError.message}`);
        }
        
        console.log('Created user profile');
      } else if (profileError) {
        throw new Error(`Error checking profile: ${profileError.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error ensuring user profile:', error);
      throw error;
    }
  }, []);

  // Files
  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to upload files');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
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
      
      router.refresh();
      return fileData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const getUserFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to view files');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error fetching files: ${error.message}`);
      }
      
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const deleteFile = useCallback(async (fileId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[DELETE HOOK DEBUG] Attempting to delete file: fileId=${fileId}`);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const errMsg = 'You must be logged in to delete files';
        console.error(`[DELETE HOOK DEBUG] ${errMsg}`);
        throw new Error(errMsg);
      }
      
      const userId = session.user.id;
      console.log(`[DELETE HOOK DEBUG] Got user ID: ${userId}`);
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      // Get file path first
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('file_path')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError) {
        console.error(`[DELETE HOOK DEBUG] Error fetching file: ${fetchError.message}`, fetchError);
        throw new Error(`Error fetching file: ${fetchError.message}`);
      }
      
      console.log(`[DELETE HOOK DEBUG] Found file: file_path=${fileData.file_path}`);
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('audio-files')
        .remove([fileData.file_path]);
      
      if (storageError) {
        console.error(`[DELETE HOOK DEBUG] Error deleting file from storage: ${storageError.message}`, storageError);
        throw new Error(`Error deleting file from storage: ${storageError.message}`);
      }
      
      console.log(`[DELETE HOOK DEBUG] Successfully deleted file from storage`);
      
      // Delete file record from database
      const { data, error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', userId)
        .select();
      
      if (deleteError) {
        console.error(`[DELETE HOOK DEBUG] Error deleting file record from database: ${deleteError.message}`, deleteError);
        throw new Error(`Error deleting file record: ${deleteError.message}`);
      }
      
      console.log(`[DELETE HOOK DEBUG] Successfully deleted file from database: ${JSON.stringify(data)}`);
      
      router.refresh();
      return true;
    } catch (err: any) {
      console.error(`[DELETE HOOK DEBUG] Error in deleteFile:`, err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  // Transcriptions
  const createTranscription = useCallback(async (fileId: string, title: string, content: string, duration?: number, metadata?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to create transcriptions');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
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
      
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const getUserTranscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[FILTER DEBUG] Hook: Getting transcriptions and filtering out deleted ones`);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to fetch transcriptions');
      }
      
      const userId = session.user.id;
      
      const { data, error } = await supabase
        .from('transcriptions')
        .select(`
          *,
          files (filename, file_path)
        `)
        .eq('user_id', userId)
        .not('deleted', 'eq', true) // Explicitly exclude records where deleted=true
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`[FILTER DEBUG] Hook: Error fetching transcriptions: ${error.message}`, error);
        throw new Error(`Error fetching transcriptions: ${error.message}`);
      }
      
      console.log(`[FILTER DEBUG] Hook: Fetched ${data?.length || 0} non-deleted transcriptions`);
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTranscription = useCallback(async (transcriptionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[FILTER DEBUG] Hook: Getting transcription ID ${transcriptionId}, excluding deleted`);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to fetch a transcription');
      }
      
      const userId = session.user.id;
      
      const { data, error } = await supabase
        .from('transcriptions')
        .select(`
          *,
          files (filename, file_path)
        `)
        .eq('id', transcriptionId)
        .eq('user_id', userId)
        .not('deleted', 'eq', true) // Explicitly exclude records where deleted=true
        .maybeSingle();
      
      if (error) {
        console.error(`[FILTER DEBUG] Hook: Error fetching transcription: ${error.message}`, error);
        throw new Error(`Error fetching transcription: ${error.message}`);
      }
      
      console.log(`[FILTER DEBUG] Hook: Fetched transcription: ${data ? 'Found' : 'Not found'}`);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTranscription = useCallback(async (transcriptionId: string, updates: Partial<{
    title: string;
    content: string;
    metadata: any;
  }>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to update transcriptions');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
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
      
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const deleteTranscription = useCallback(async (transcriptionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[DELETE HOOK DEBUG] Attempting to soft-delete transcription: transcriptionId=${transcriptionId}`);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const errMsg = 'You must be logged in to delete transcriptions';
        console.error(`[DELETE HOOK DEBUG] ${errMsg}`);
        throw new Error(errMsg);
      }
      
      const userId = session.user.id;
      console.log(`[DELETE HOOK DEBUG] Got user ID: ${userId}`);
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      // Instead of deleting, update the deleted column to true
      const { data, error } = await supabase
        .from('transcriptions')
        .update({ deleted: true })
        .eq('id', transcriptionId)
        .eq('user_id', userId)
        .select();
      
      if (error) {
        console.error(`[DELETE HOOK DEBUG] Error soft-deleting transcription: ${error.message}`, error);
        throw new Error(`Error soft-deleting transcription: ${error.message}`);
      }
      
      console.log(`[DELETE HOOK DEBUG] Successfully soft-deleted transcription: ${JSON.stringify(data)}`);
      
      router.refresh();
      return true;
    } catch (err: any) {
      console.error(`[DELETE HOOK DEBUG] Error in deleteTranscription:`, err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  // Analyses
  const createAnalysis = useCallback(async (transcriptionId: string | null, title: string, content: string, analysisType: string, metadata?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to create analyses');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
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
      
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const getUserAnalyses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[FILTER DEBUG] Hook: Getting analyses with non-deleted transcriptions`);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('getUserAnalyses: No session found');
        throw new Error('You must be logged in to view analyses');
      }
      
      const userId = session.user.id;
      console.log('getUserAnalyses: User ID:', userId);
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          *,
          transcriptions!inner (
            id,
            title,
            content,
            deleted
          )
        `)
        .eq('user_id', userId)
        .eq('transcriptions.deleted', false) // Only include analyses with non-deleted transcriptions
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('getUserAnalyses: Error fetching analyses:', error);
        throw new Error(`Error fetching analyses: ${error.message}`);
      }
      
      console.log(`[FILTER DEBUG] Hook: Fetched ${data?.length || 0} analyses with non-deleted transcriptions`);
      return data || [];
    } catch (err: any) {
      console.error('getUserAnalyses: Caught error:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const getAnalysesForTranscription = useCallback(async (transcriptionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to view analyses');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
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
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  // Get a single analysis by ID
  const getAnalysis = useCallback(async (analysisId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`useDatabase - Getting analysis with ID: ${analysisId}`);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to view analyses');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      // Using maybeSingle() instead of single() to avoid the error when no row is found
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .eq('user_id', userId) // Keep user_id check for security
        .maybeSingle();
      
      if (error) {
        throw new Error(`Error fetching analysis: ${error.message}`);
      }
      
      console.log(`useDatabase - Analysis fetch result:`, data ? "Found" : "Not found");
      
      return data;
    } catch (err: any) {
      console.error("Error in getAnalysis:", err);
      setError(err.message);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const updateAnalysis = useCallback(async (analysisId: string, updates: Partial<{
    title: string;
    content: string;
    metadata: any;
  }>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to update analyses');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
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
      
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  // Function to remove transcription reference from an analysis
  const removeTranscriptionReference = useCallback(async (analysisId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to update analyses');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      // Import the function from db.ts
      const { removeTranscriptionReference: dbRemoveTranscriptionReference } = await import('@/lib/db');
      
      // Call the function
      const data = await dbRemoveTranscriptionReference(userId, analysisId);
      
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const deleteAnalysis = useCallback(async (analysisId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to delete analyses');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(`Error deleting analysis: ${error.message}`);
      }
      
      router.refresh();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  // User profile
  const getUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to view your profile');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw new Error(`Error fetching profile: ${error.message}`);
      }
      
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const updateUserProfile = useCallback(async (updates: Partial<{
    full_name: string;
    avatar_url: string;
  }>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to update your profile');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error updating profile: ${error.message}`);
      }
      
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  // Subscription
  const getUserSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to view your subscription');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        throw new Error(`Error fetching subscription: ${error.message}`);
      }
      
      return data || null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  // Translations
  const createTranslation = useCallback(async (originalId: string, originalType: string, language: string, content: string, title?: string, metadata?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to create translations');
      }
      
      const userId = session.user.id;
      
      // Ensure user profile exists
      await ensureUserProfile(userId);
      
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
      
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router, ensureUserProfile]);

  const getTranslation = useCallback(async (originalId: string, language: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to get translations');
      }
      
      const userId = session.user.id;
      
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
    } catch (err: any) {
      if (err.message.includes('PGRST116')) {
        // No translation found
        return null;
      }
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTranslation = useCallback(async (translationId: string, updates: Partial<{
    title: string;
    content: string;
    metadata: any;
  }>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to update translations');
      }
      
      const userId = session.user.id;
      
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
      
      router.refresh();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const deleteTranslation = useCallback(async (translationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to delete translations');
      }
      
      const userId = session.user.id;
      
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', translationId)
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(`Error deleting translation: ${error.message}`);
      }
      
      router.refresh();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    isLoading,
    error,
    resetError,
    // Files
    uploadFile,
    getUserFiles,
    deleteFile,
    // Transcriptions
    createTranscription,
    getUserTranscriptions,
    getTranscription,
    updateTranscription,
    deleteTranscription,
    // Analyses
    createAnalysis,
    getUserAnalyses,
    getAnalysesForTranscription,
    getAnalysis,
    updateAnalysis,
    removeTranscriptionReference,
    deleteAnalysis,
    // User profile
    getUserProfile,
    updateUserProfile,
    // Subscription
    getUserSubscription,
    // Translations
    createTranslation,
    getTranslation,
    updateTranslation,
    deleteTranslation
  };
} 