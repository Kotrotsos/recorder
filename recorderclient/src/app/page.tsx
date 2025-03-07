import PageContent from '@/components/PageContent';
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <div className="container mx-auto py-4 flex justify-end space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm">Hello, {user.email}</span>
            <Link 
              href="/account" 
              className="text-sm font-medium hover:underline"
            >
              Account
            </Link>
            <form action="/auth/signout" method="post">
              <button 
                type="submit"
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-medium hover:underline"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium hover:underline"
            >
              Register
            </Link>
          </div>
        )}
      </div>
      <PageContent />
    </div>
  );
}
