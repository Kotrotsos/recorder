-- Create ui_settings table
CREATE TABLE IF NOT EXISTS public.ui_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ui_mode TEXT NOT NULL DEFAULT 'fun', -- 'fun' or 'flat'
  gradient_from TEXT DEFAULT '#4338ca', -- indigo-900
  gradient_via TEXT DEFAULT '#6d28d9', -- purple-800
  gradient_to TEXT DEFAULT '#be185d', -- pink-700
  flat_color TEXT DEFAULT '#4338ca', -- Default flat color (indigo-900)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS ui_settings_user_id_idx ON public.ui_settings(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.ui_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own UI settings
CREATE POLICY ui_settings_select_policy ON public.ui_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own UI settings
CREATE POLICY ui_settings_insert_policy ON public.ui_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own UI settings
CREATE POLICY ui_settings_update_policy ON public.ui_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own UI settings
CREATE POLICY ui_settings_delete_policy ON public.ui_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update the updated_at column
CREATE TRIGGER update_ui_settings_updated_at
  BEFORE UPDATE ON public.ui_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 