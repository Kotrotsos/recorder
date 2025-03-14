-- Create webhook_settings table
CREATE TABLE IF NOT EXISTS public.webhook_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  webhook_event TEXT NOT NULL DEFAULT 'transcription_created',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS webhook_settings_user_id_idx ON public.webhook_settings(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own webhook settings
CREATE POLICY webhook_settings_select_policy ON public.webhook_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own webhook settings
CREATE POLICY webhook_settings_insert_policy ON public.webhook_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own webhook settings
CREATE POLICY webhook_settings_update_policy ON public.webhook_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own webhook settings
CREATE POLICY webhook_settings_delete_policy ON public.webhook_settings
  FOR DELETE USING (auth.uid() = user_id); 