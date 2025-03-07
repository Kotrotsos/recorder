import RegisterForm from '@/components/auth/register-form'
import AuthLayout from '@/components/auth/auth-layout'

export const metadata = {
  title: 'Register | Audio Recorder',
  description: 'Create a new Audio Recorder account',
}

export default function RegisterPage() {
  return (
    <AuthLayout title="" description="">
      <RegisterForm />
    </AuthLayout>
  )
} 