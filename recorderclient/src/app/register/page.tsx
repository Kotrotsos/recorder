import RegisterForm from '@/components/auth/register-form'

export const metadata = {
  title: 'Register | Audio Recorder',
  description: 'Create a new Audio Recorder account',
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Create an Account</h1>
        <RegisterForm />
      </div>
    </div>
  )
} 