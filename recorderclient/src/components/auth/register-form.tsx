"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
 
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // Validate terms acceptance
    if (!termsAccepted) {
      setError('You must accept the Terms of Service to register')
      setLoading(false)
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: name,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage('Check your email for the confirmation link')
    } catch (error) {
      console.error('Error registering:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white">Register</CardTitle>
        <CardDescription className="text-white/70">
          Create a new account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
            />
          </div>
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked: boolean | 'indeterminate') => setTermsAccepted(checked === true)}
              className="bg-white/10 border-white/20 data-[state=checked]:bg-white/30 data-[state=checked]:text-white"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the{' '}
                <Link href="/terms-of-service" className="text-white underline hover:text-white/80" target="_blank">
                  Terms of Service
                </Link>
              </label>
            </div>
          </div>
          {error && (
            <div className="text-sm font-medium text-red-300">{error}</div>
          )}
          {message && (
            <div className="text-sm font-medium text-green-300">{message}</div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-white/20 hover:bg-white/30 text-white" 
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 border-t border-white/10 pt-4">
        <div className="text-sm text-center text-white/70">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:text-white/80 underline underline-offset-4">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
} 