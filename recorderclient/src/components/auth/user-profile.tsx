"use client"

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { isLifetimeSupporter } from '@/utils/subscription'
import { Eye, EyeOff } from 'lucide-react'

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isGoldmember, setIsGoldmember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  
  const supabase = createClient()
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        if (user) {
          // Set initial form values
          setEmail(user.email || '')
          
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setFullName(profile.full_name || '')
            setAvatarUrl(profile.avatar_url || '')
          }
          
          // Check if the user is a lifetime supporter
          const isSupporter = await isLifetimeSupporter()
          setIsGoldmember(isSupporter)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [user, supabase])
  
  // Add a function to handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log('Attempting to log out...');
      
      // Use the current window's origin to ensure we don't have CORS issues
      const baseUrl = window.location.origin;
      const logoutUrl = `${baseUrl}/auth/signout`;
      
      console.log('Sending logout request to:', logoutUrl);
      
      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies with the request
      });
      
      console.log('Logout response status:', response.status);
      
      if (response.ok) {
        console.log('Logout successful, clearing local state and redirecting...');
        
        // Force clear any local auth state
        await supabase.auth.signOut();
        
        // Use window.location.replace for a complete page refresh
        setTimeout(() => {
          console.log('Redirecting to home page...');
          window.location.replace('/');
        }, 500);
      } else {
        console.error('Logout failed with status:', response.status);
        throw new Error(`Logout failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    setLoading(true)
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
      
      if (profileError) throw profileError
      
      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password,
        })
        
        if (passwordError) throw passwordError
        
        // Clear password field after update
        setPassword('')
        setShowPassword(false)
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.rpc('delete_user')
      
      if (error) throw error
      
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Deletion failed",
        description: "There was an error deleting your account. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }
  
  return (
    <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
      <CardHeader className="space-y-1 p-6">
        <CardTitle className="text-2xl font-bold text-white">Edit Profile</CardTitle>
        <CardDescription className="text-white/70">
          Update your personal information
        </CardDescription>
        {isGoldmember && (
          <div className="mt-2 inline-flex items-center bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full px-3 py-1 text-sm">
            You are awesome, Goldmember! ✨
          </div>
        )}
      </CardHeader>
      
      <form onSubmit={updateProfile}>
        <CardContent className="p-6 pt-0 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70" htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-white/10 border-white/20 text-white/50 focus:border-white/30 focus:ring-white/30"
            />
            <p className="text-sm text-white/60">
              Email cannot be changed
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70" htmlFor="fullname">Full Name</label>
            <Input
              id="fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70" htmlFor="password">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-white/60">
              Leave blank to keep current password
            </p>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-medium mb-4 text-white">Account logout</h3>
            <p className="text-sm text-white/60 mb-4">
              Log out of your account to end your current session.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              disabled={loading}
              className="text-white bg-white/10 border-white/20 hover:bg-white/20 hover:text-white"
            >
              {loading ? 'Logging out...' : 'Log Out'}
            </Button>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-medium mb-4 text-white">Account deletion</h3>
            <p className="text-sm text-white/60 mb-4">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="hover:bg-red-700"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 