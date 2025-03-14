-- Add foreground_color column to ui_settings table
ALTER TABLE public.ui_settings 
ADD COLUMN IF NOT EXISTS foreground_color TEXT DEFAULT '#ffffff';

-- Add comment to explain the column
COMMENT ON COLUMN public.ui_settings.foreground_color IS 'Text color for the UI, defaults to white (#ffffff)'; 