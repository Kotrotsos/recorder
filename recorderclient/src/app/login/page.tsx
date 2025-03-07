import LoginForm from '@/components/auth/login-form'
import AuthLayout from '@/components/auth/auth-layout'

export const metadata = {
  title: 'Login | Audio Recorder',
  description: 'Login to your Audio Recorder account',
}

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back" description="Sign in to your account to continue">
      <LoginForm />
    </AuthLayout>
  )
} 