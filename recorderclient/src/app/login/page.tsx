import LoginForm from '@/components/auth/login-form'

export const metadata = {
  title: 'Login | Audio Recorder',
  description: 'Login to your Audio Recorder account',
}

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>
        <LoginForm />
      </div>
    </div>
  )
} 