-- Migration: Add Translations Table
-- Description: Creates a table to store translations of content

-- Create translations table
CREATE TABLE public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  original_id uuid NOT NULL, -- Can reference either transcription_id or analysis_id
  original_type text NOT NULL, -- 'transcription', 'analysis', or 'summary'
  language text NOT NULL,
  title text,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.translations IS 'Stores translations of transcriptions and analyses';

-- Enable Row Level Security
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for translations
CREATE POLICY "Users can view their own translations"
  ON public.translations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own translations"
  ON public.translations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own translations"
  ON public.translations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own translations"
  ON public.translations FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX translations_original_id_idx ON public.translations(original_id);
CREATE INDEX translations_language_idx ON public.translations(language);
CREATE INDEX translations_user_id_idx ON public.translations(user_id); 