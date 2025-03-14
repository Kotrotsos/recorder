import LoginForm from '@/components/auth/login-form'
import AuthLayout from '@/components/auth/auth-layout'
import { Suspense } from 'react'

export const metadata = {
  title: 'Login | Audio Recorder',
  description: 'Login to your Audio Recorder account',
}

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back" description="Sign in to your account to continue">
      <Suspense fallback={<div className="p-8 text-center text-white">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
} 