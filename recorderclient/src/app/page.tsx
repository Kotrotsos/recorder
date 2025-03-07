import PageContent from '@/components/PageContent';
import { createClient } from '@/lib/supabase-server';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Log the user data on the server side for debugging
  console.log('Server-side user data:', user ? 'User is logged in' : 'No user logged in');

  return (
    <div>
      <PageContent user={user} />
    </div>
  );
}
