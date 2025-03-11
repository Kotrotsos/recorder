import PageContent from '@/components/PageContent';

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // We'll let the client-side handle authentication
  // This avoids the cookies issue with server components
  return <PageContent user={null} />;
}
