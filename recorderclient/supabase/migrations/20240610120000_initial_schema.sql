-- Migration: Initial Schema Creation
-- Description: Creates the initial database schema for the recorder application
-- Tables: profiles, files, transcriptions, analyses, subscriptions

-- Create profiles table to extend the auth.users table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.profiles is 'User profiles extending the auth.users table';

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create RLS policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "New users can insert their profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create files table to store uploaded files
create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  filename text not null,
  file_path text not null,
  file_size bigint not null,
  mime_type text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.files is 'Stores information about uploaded audio files';

-- Enable Row Level Security
alter table public.files enable row level security;

-- Create RLS policies for files
create policy "Users can view their own files"
  on public.files for select
  using (auth.uid() = user_id);

create policy "Users can insert their own files"
  on public.files for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own files"
  on public.files for update
  using (auth.uid() = user_id);

create policy "Users can delete their own files"
  on public.files for delete
  using (auth.uid() = user_id);

-- Create transcriptions table
create table public.transcriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_id uuid references public.files(id) on delete cascade not null,
  title text not null,
  content text not null,
  duration integer, -- Duration in seconds
  language text default 'en',
  status text default 'completed',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.transcriptions is 'Stores transcriptions of audio files';

-- Enable Row Level Security
alter table public.transcriptions enable row level security;

-- Create RLS policies for transcriptions
create policy "Users can view their own transcriptions"
  on public.transcriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transcriptions"
  on public.transcriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transcriptions"
  on public.transcriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transcriptions"
  on public.transcriptions for delete
  using (auth.uid() = user_id);

-- Create analyses table
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  transcription_id uuid references public.transcriptions(id) on delete cascade not null,
  title text not null,
  content text not null,
  analysis_type text not null, -- e.g., 'summary', 'sentiment', 'key_points'
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.analyses is 'Stores analyses of transcriptions';

-- Enable Row Level Security
alter table public.analyses enable row level security;

-- Create RLS policies for analyses
create policy "Users can view their own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own analyses"
  on public.analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- Create subscriptions table for future payment system
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id text not null, -- e.g., 'free', 'basic', 'premium'
  status text not null, -- e.g., 'active', 'canceled', 'past_due'
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  cancel_at_period_end boolean default false,
  payment_provider text, -- e.g., 'stripe'
  payment_provider_subscription_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.subscriptions is 'Stores user subscription information for the payment system';

-- Enable Row Level Security
alter table public.subscriptions enable row level security;

-- Create RLS policies for subscriptions
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Create trigger to automatically create a profile when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create function to update the updated_at column
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers to automatically update the updated_at column
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_files_updated_at
  before update on public.files
  for each row execute function public.update_updated_at_column();

create trigger update_transcriptions_updated_at
  before update on public.transcriptions
  for each row execute function public.update_updated_at_column();

create trigger update_analyses_updated_at
  before update on public.analyses
  for each row execute function public.update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at_column(); 