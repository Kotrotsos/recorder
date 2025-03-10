import PageContent from '@/components/PageContent';
import { createClient } from '@/lib/supabase-server';

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Await the createClient() function since it's async
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Log the user data on the server side for debugging
  console.log('Server-side user data:', user ? 'User is logged in' : 'No user logged in');

  return (
    <div>
      <PageContent user={user} />
    </div>
  );
}
