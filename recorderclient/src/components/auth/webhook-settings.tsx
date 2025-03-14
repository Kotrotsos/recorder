"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User } from '@supabase/supabase-js'

export default function WebhookSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookEvent, setWebhookEvent] = useState('transcription_created')
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          // Fetch webhook settings from the database
          const { data, error } = await supabase
            .from('webhook_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (data && !error) {
            setWebhookUrl(data.webhook_url || '')
            setWebhookEvent(data.webhook_event || 'transcription_created')
          }
        }
      } catch (error) {
        console.error('Error getting user or webhook settings:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase.auth])

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)
    setError(null)

    if (!user) {
      setError('You must be logged in to save webhook settings')
      setUpdating(false)
      return
    }

    try {
      // Check if webhook settings already exist for this user
      const { data: existingSettings } = await supabase
        .from('webhook_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let result
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('webhook_settings')
          .update({
            webhook_url: webhookUrl,
            webhook_event: webhookEvent,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } else {
        // Insert new settings
        result = await supabase
          .from('webhook_settings')
          .insert({
            user_id: user.id,
            webhook_url: webhookUrl,
            webhook_event: webhookEvent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      if (result.error) {
        setError(result.error.message)
        return
      }

      setMessage('Webhook settings saved successfully')
    } catch (error) {
      console.error('Error saving webhook settings:', error)
      setError('An unexpected error occurred')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Loading...</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Please log in to view your webhook settings.</div>
  }

  return (
    <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
      <CardHeader className="space-y-1 p-6">
        <CardTitle className="text-2xl font-bold text-white">Webhook Settings</CardTitle>
        <CardDescription className="text-white/70">
          Configure webhooks to integrate with your workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Configure webhook</h3>
          <form onSubmit={handleSaveWebhook} className="space-y-6">
            <div className="space-y-5">
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhookUrl" className="text-sm text-white/70">Webhook URL</Label>
                <div className="relative">
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://your-app.com/webhook"
                    value={webhookUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebhookUrl(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30 pl-3 py-2 h-12 text-base"
                  />
                </div>
                <p className="text-xs text-white/60">
                  We'll send POST requests to this URL when the selected event occurs.
                </p>
              </div>
              
              {/* Webhook Event */}
              <div className="space-y-2">
                <Label htmlFor="webhookEvent" className="text-sm text-white/70">Webhook Event</Label>
                <Select 
                  value={webhookEvent} 
                  onValueChange={setWebhookEvent}
                >
                  <SelectTrigger 
                    id="webhookEvent" 
                    className="bg-white/10 border-white/20 text-white focus:border-white/30 focus:ring-white/30 h-12"
                  >
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20 text-white">
                    <SelectItem value="transcription_created">After transcription created</SelectItem>
                    <SelectItem value="analysis_created">After analysis created</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/60">
                  Choose when to trigger the webhook.
                </p>
              </div>
            </div>
            
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
            
            <Button 
              type="submit" 
              className="bg-white/20 hover:bg-white/30 text-white w-full md:w-auto" 
              disabled={updating}
            >
              {updating ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Webhooks Information</h3>
          <p className="text-sm text-white/80">
            Webhooks allow your application to receive real-time notifications about events in your rec.ai account. 
            The webhook payload includes detailed information about the event that triggered it.
          </p>
          <div className="mt-3 text-xs text-white/60">
            <p>Sample webhook payload:</p>
            <pre className="bg-black/30 p-2 rounded mt-1 overflow-x-auto">
              {`{
  "event": "transcription_created",
  "timestamp": "2023-09-15T08:24:35Z",
  "data": {
    "id": "trans_123456",
    "recording_id": "rec_789012",
    "status": "completed"
  }
}`}
            </pre>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-white/10 pt-4 p-6">
        <div className="text-xs text-white/60 w-full">
          Need help with webhooks? Check out our <a href="#" className="text-blue-300 hover:underline">developer documentation</a>.
        </div>
      </CardFooter>
    </Card>
  )
} 