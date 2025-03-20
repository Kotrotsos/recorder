
-- Create custom_prompts table
CREATE TABLE IF NOT EXISTS custom_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE custom_prompts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom_prompts
CREATE POLICY "Users can view their own custom prompts" 
  ON custom_prompts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom prompts" 
  ON custom_prompts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom prompts" 
  ON custom_prompts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom prompts" 
  ON custom_prompts FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX custom_prompts_user_id_idx ON custom_prompts (user_id); 