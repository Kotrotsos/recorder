"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LogoutButton from './logout-button'
import { User } from '@supabase/supabase-js'
import SupporterBadge from '@/components/SupporterBadge'
import { isLifetimeSupporter } from '@/utils/subscription'
import { Eye, EyeOff } from 'lucide-react'

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupporter, setIsSupporter] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          setEmail(user.email || '')
          
          // Check if the user is a lifetime supporter
          const supporter = await isLifetimeSupporter()
          setIsSupporter(supporter)
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase.auth])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage('Profile updated successfully. Check your email for confirmation.')
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordChange = () => {
    // To be implemented
    alert('Password change functionality would be implemented here')
  }

  const handleDeleteAccount = () => {
    // To be implemented
    alert('Account deletion functionality would be implemented here')
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Loading...</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Please log in to view your profile.</div>
  }

  return (
    <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
      <CardHeader className="space-y-1 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white">Your account</CardTitle>
          {isSupporter && <SupporterBadge className="ml-2" />}
        </div>
        <CardDescription className="text-white/70">
          Make changes to your personal information or account type
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-8">
        {/* Account Information Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Your account</h3>
          <div className="space-y-6">
            {/* Email */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="email" className="text-sm text-white/70">Email • Private</Label>
              </div>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30 pl-3 pr-10 py-2 h-12 text-base"
                />
                <Button
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="absolute right-0 top-0 h-full px-4 text-white/70 hover:text-white bg-transparent hover:bg-white/10"
                >
                  Save
                </Button>
              </div>
            </div>
            
            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm text-white/70">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value="••••••••"
                  disabled
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30 pl-3 pr-10 py-2 h-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-20 top-0 h-full px-3 text-white/70 hover:text-white bg-transparent"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <Button
                  type="button"
                  onClick={handlePasswordChange}
                  className="absolute right-0 top-0 h-full px-4 text-white/70 hover:text-white bg-transparent hover:bg-white/10"
                >
                  Change
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Deletion Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Account deletion</h3>
          
          {/* Delete Account */}
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-medium">Delete your data and account</h4>
                <p className="text-sm text-white/70">
                  Permanently delete your data and everything associated with your account
                </p>
              </div>
              <Button 
                type="button" 
                onClick={handleDeleteAccount}
                variant="destructive"
                className="bg-red-900/50 hover:bg-red-900/70 text-white border-red-800/50"
              >
                Delete account
              </Button>
            </div>
          </div>
        </div>
        
        {isSupporter && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <h3 className="text-amber-400 font-medium mb-1">You are awesome, Goldmember!</h3>
            <p className="text-sm text-white/80">
              Thank you for supporting this project! You have lifetime access to all premium features.
            </p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm font-medium text-red-300">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-sm font-medium text-green-300">
            {message}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-white/10 pt-4 p-6">
        <div className="text-sm text-white/60">
          User ID: {user.id.substring(0, 8)}...
        </div>
        <LogoutButton variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20" />
      </CardFooter>
    </Card>
  )
} 