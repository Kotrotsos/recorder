-- Migration: Create Storage Buckets
-- Description: Creates storage buckets for audio files and other media

-- Create a bucket for audio files
insert into storage.buckets (id, name, public)
values ('audio-files', 'audio-files', false);

-- Set up security for the audio-files bucket
create policy "Users can view their own audio files"
  on storage.objects for select
  using (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own audio files"
  on storage.objects for insert
  with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own audio files"
  on storage.objects for update
  using (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own audio files"
  on storage.objects for delete
  using (auth.uid()::text = (storage.foldername(name))[1]); 