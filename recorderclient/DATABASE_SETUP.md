# Database Setup for Recorder Application

This document explains how to set up the database for the Recorder application.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker](https://www.docker.com/products/docker-desktop/)

## Setup

1. Install the Supabase CLI:

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

2. Start the local Supabase development environment:

```bash
supabase start
```

3. Run the migrations:

```bash
supabase db reset
```

This will create all the necessary tables and set up the storage buckets.

## Database Schema

The database schema consists of the following tables:

- `profiles`: Extends the `auth.users` table to store additional user information
- `files`: Stores information about uploaded audio files
- `transcriptions`: Stores transcriptions of audio files
- `analyses`: Stores analyses of transcriptions
- `subscriptions`: Stores user subscription information for the payment system

## Storage

The application uses Supabase Storage to store audio files. The files are stored in the `audio-files` bucket, with each user's files stored in a folder named after their user ID.

## Authentication

The application uses Supabase Auth for authentication. When a user signs up, a profile is automatically created for them in the `profiles` table.

## Row Level Security

All tables have Row Level Security (RLS) enabled, which ensures that users can only access their own data. The RLS policies are set up in the migrations.

## API

The application uses the Supabase JavaScript client to interact with the database. The client is set up in the `src/lib/supabase.ts` and `src/lib/supabase-server.ts` files.

## Deployment

To deploy the database to a production environment, you need to:

1. Create a Supabase project at [app.supabase.com](https://app.supabase.com)
2. Link your local project to the remote project:

```bash
supabase link --project-ref <project-ref>
```

3. Push the migrations to the remote project:

```bash
supabase db push
```

## Environment Variables

The application uses the following environment variables to connect to the database:

- `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key of your Supabase project

These variables should be set in the `.env.local` file for local development, and in your deployment environment for production. 