# Supabase Database Setup

This directory contains the database migrations for the Recorder application.

## Migrations

The migrations are SQL files that are executed in order to set up the database schema. They are located in the `migrations` directory.

### Initial Schema

The initial schema creates the following tables:

- `profiles`: Extends the `auth.users` table to store additional user information
- `files`: Stores information about uploaded audio files
- `transcriptions`: Stores transcriptions of audio files
- `analyses`: Stores analyses of transcriptions
- `subscriptions`: Stores user subscription information for the payment system

### Storage Buckets

The storage buckets migration creates a bucket for audio files and sets up security policies for it.

## Running Migrations

To run the migrations, you need to have the Supabase CLI installed. Then, you can run:

```bash
supabase db reset
```

This will reset the database and run all migrations.

## Database Schema

### Profiles

The `profiles` table extends the `auth.users` table to store additional user information.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
```

### Files

The `files` table stores information about uploaded audio files.

```sql
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
```

### Transcriptions

The `transcriptions` table stores transcriptions of audio files.

```sql
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
```

### Analyses

The `analyses` table stores analyses of transcriptions.

```sql
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
```

### Subscriptions

The `subscriptions` table stores user subscription information for the payment system.

```sql
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
``` 