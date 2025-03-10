-- Allow null values for transcription_id in analyses table
ALTER TABLE analyses ALTER COLUMN transcription_id DROP NOT NULL; 