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

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupporter, setIsSupporter] = useState(false)
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Loading...</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Please log in to view your profile.</div>
  }

  return (
    <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white">Your Profile</CardTitle>
          {isSupporter && <SupporterBadge className="ml-2" />}
        </div>
        <CardDescription className="text-white/70">
          Manage your account settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
            />
            <p className="text-xs text-white/60">
              Changing your email will require confirmation from the new address.
            </p>
          </div>
          
          {isSupporter && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <h3 className="text-amber-400 font-medium mb-1">Lifetime Supporter</h3>
              <p className="text-xs text-white/80">
                Thank you for supporting this project! You have lifetime access to all premium features.
              </p>
            </div>
          )}
          
          {error && (
            <div className="text-sm font-medium text-red-300">{error}</div>
          )}
          {message && (
            <div className="text-sm font-medium text-green-300">{message}</div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-white/20 hover:bg-white/30 text-white" 
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-white/10 pt-4">
        <div className="text-sm text-white/60">
          User ID: {user.id.substring(0, 8)}...
        </div>
        <LogoutButton variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20" />
      </CardFooter>
    </Card>
  )
} 