import { useAuth as useAuthContext } from '@/contexts/auth-context';

// For backward compatibility - redirects to the auth context hook
export default function useAuth() {
  return useAuthContext();
} 