import RegisterForm from '@/components/auth/register-form'
import AuthLayout from '@/components/auth/auth-layout'
import { Suspense } from 'react'

export const metadata = {
  title: 'Register | Audio Recorder',
  description: 'Create a new Audio Recorder account',
}

export default function RegisterPage() {
  return (
    <AuthLayout title="" description="">
      <Suspense fallback={<div className="p-8 text-center text-white">Loading registration form...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  )
} 