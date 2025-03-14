import { createClient } from '@/lib/supabase';

interface WebhookPayload {
  transcript: any;
  document: any;
  user_id: string;
}

/**
 * Sends a webhook notification if the user has configured webhook settings
 * @param userId The user ID
 * @param eventType The event type (transcription_created or analysis_created)
 * @param transcript The transcript data
 * @param document The analysis document data (empty for transcription_created events)
 */
export async function sendWebhookNotification(
  userId: string,
  eventType: 'transcription_created' | 'analysis_created',
  transcript: any,
  document: any = {}
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Check if the user has webhook settings for this event type
    const { data: webhookSettings, error } = await supabase
      .from('webhook_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('webhook_event', eventType)
      .single();
    
    if (error || !webhookSettings) {
      // No webhook settings found for this user and event type
      console.log(`No webhook settings found for user ${userId} and event ${eventType}`);
      return false;
    }
    
    // Prepare the payload
    const payload: WebhookPayload = {
      transcript,
      document,
      user_id: userId
    };
    
    // Send the webhook
    console.log(`Sending webhook to ${webhookSettings.webhook_url} for event ${eventType}`);
    
    const response = await fetch(webhookSettings.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': eventType
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Webhook request failed with status ${response.status}: ${await response.text()}`);
      return false;
    }
    
    console.log(`Webhook sent successfully for user ${userId} and event ${eventType}`);
    return true;
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    return false;
  }
} 