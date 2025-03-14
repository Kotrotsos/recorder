"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User } from '@supabase/supabase-js'
import { HexColorPicker } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUISettings } from '@/contexts/ui-settings-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Default UI settings for reset functionality
const defaultUISettings = {
  ui_mode: 'fun' as 'fun' | 'flat',
  gradient_from: '#4338ca', // indigo-900
  gradient_via: '#6d28d9', // purple-800
  gradient_to: '#be185d', // pink-700
  flat_color: '#4338ca', // indigo-900
  foreground_color: '#ffffff' // white
}

export default function UISettings() {
  const { 
    uiSettings, 
    updateUISettings, 
    saveUISettings, 
    hasUnsavedChanges 
  } = useUISettings()
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Color picker states
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null)
  
  // Dialog state
  const [gradientDialogOpen, setGradientDialogOpen] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase.auth])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    if (!user) {
      setError('You must be logged in to save UI settings')
      setSaving(false)
      return
    }

    try {
      const result = await saveUISettings()
      
      if (result.success) {
        setMessage(result.message)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Error saving UI settings:', error)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Handle UI mode change
  const handleUIModeChange = (isChecked: boolean) => {
    updateUISettings({ ui_mode: isChecked ? 'fun' : 'flat' })
  }

  // Handle color change
  const handleColorChange = (colorType: string, color: string) => {
    switch (colorType) {
      case 'gradient-from':
        updateUISettings({ gradient_from: color })
        break
      case 'gradient-via':
        updateUISettings({ gradient_via: color })
        break
      case 'gradient-to':
        updateUISettings({ gradient_to: color })
        break
      case 'flat-color':
        updateUISettings({ flat_color: color })
        break
      case 'foreground-color':
        updateUISettings({ foreground_color: color })
        break
    }
  }

  // Reset UI settings to defaults
  const handleResetSettings = () => {
    setMessage(null)
    setError(null)
    
    // Update all settings to defaults
    updateUISettings({
      ui_mode: defaultUISettings.ui_mode,
      gradient_from: defaultUISettings.gradient_from,
      gradient_via: defaultUISettings.gradient_via,
      gradient_to: defaultUISettings.gradient_to,
      flat_color: defaultUISettings.flat_color,
      foreground_color: defaultUISettings.foreground_color
    })
    
    setMessage('Settings reset to defaults. Click Save to make permanent.')
  }

  // Preview component to show how text will look against the background
  const ColorPreview = ({ background, foreground }: { background: string, foreground: string }) => (
    <div 
      className="h-20 rounded-md mt-2 flex items-center justify-center" 
      style={{ background }}
    >
      <span style={{ color: foreground, fontWeight: 'bold' }}>
        Preview Text
      </span>
    </div>
  )

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Loading...</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Please log in to view your UI settings.</div>
  }

  return (
    <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg h-full">
      <CardHeader className="space-y-1 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white">UI Settings</CardTitle>
          {hasUnsavedChanges && (
            <div className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded text-xs font-medium">
              Unsaved Changes
            </div>
          )}
        </div>
        <CardDescription className="text-white/70">
          Customize the appearance of your interface
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ui-mode" className="text-white">UI Mode</Label>
              <div className="text-sm text-white/60">
                Switch between fun gradient and flat color mode
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="ui-mode" className="text-white/60">Flat</Label>
              <Switch 
                id="ui-mode" 
                checked={uiSettings.ui_mode === 'fun'}
                onCheckedChange={handleUIModeChange}
              />
              <Label htmlFor="ui-mode" className="text-white">Fun</Label>
            </div>
          </div>
          
          <Tabs defaultValue="background" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="foreground">Text Color</TabsTrigger>
            </TabsList>
            
            <TabsContent value="background">
              {uiSettings.ui_mode === 'fun' ? (
                <div className="space-y-4">
                  <div className="text-white font-medium">Set the Gradient Colors</div>
                  
                  <Dialog open={gradientDialogOpen} onOpenChange={setGradientDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button"
                        className="w-full bg-white/10 hover:bg-white/20 text-white mb-4"
                      >
                        Open Gradient Editor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Gradient Editor</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="gradient-from" className="text-white">From Color</Label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              id="gradient-from" 
                              value={uiSettings.gradient_from} 
                              onChange={(e) => handleColorChange('gradient-from', e.target.value)} 
                              className="w-12 h-10 border-0 cursor-pointer"
                            />
                            <Input 
                              value={uiSettings.gradient_from}
                              onChange={(e) => handleColorChange('gradient-from', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gradient-via" className="text-white">Via Color</Label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              id="gradient-via" 
                              value={uiSettings.gradient_via} 
                              onChange={(e) => handleColorChange('gradient-via', e.target.value)} 
                              className="w-12 h-10 border-0 cursor-pointer"
                            />
                            <Input 
                              value={uiSettings.gradient_via}
                              onChange={(e) => handleColorChange('gradient-via', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gradient-to" className="text-white">To Color</Label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              id="gradient-to" 
                              value={uiSettings.gradient_to} 
                              onChange={(e) => handleColorChange('gradient-to', e.target.value)} 
                              className="w-12 h-10 border-0 cursor-pointer"
                            />
                            <Input 
                              value={uiSettings.gradient_to}
                              onChange={(e) => handleColorChange('gradient-to', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <ColorPreview 
                            background={`linear-gradient(to right, ${uiSettings.gradient_from}, ${uiSettings.gradient_via}, ${uiSettings.gradient_to})`}
                            foreground={uiSettings.foreground_color}
                          />
                        </div>
                        
                        <Button 
                          type="button" 
                          onClick={() => setGradientDialogOpen(false)}
                          className="mt-2 bg-white/10 hover:bg-white/20 text-white"
                        >
                          Done
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-10 h-10 rounded-md border-2 border-white/20" 
                        style={{ backgroundColor: uiSettings.gradient_from }}
                      />
                      <span className="text-xs text-white/60 mt-1">From</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-10 h-10 rounded-md border-2 border-white/20" 
                        style={{ backgroundColor: uiSettings.gradient_via }}
                      />
                      <span className="text-xs text-white/60 mt-1">Via</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-10 h-10 rounded-md border-2 border-white/20" 
                        style={{ backgroundColor: uiSettings.gradient_to }}
                      />
                      <span className="text-xs text-white/60 mt-1">To</span>
                    </div>
                  </div>
                  
                  <ColorPreview 
                    background={`linear-gradient(to right, ${uiSettings.gradient_from}, ${uiSettings.gradient_via}, ${uiSettings.gradient_to})`}
                    foreground={uiSettings.foreground_color}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-white font-medium">Flat Color</div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      id="flat-color"
                      value={uiSettings.flat_color} 
                      onChange={(e) => handleColorChange('flat-color', e.target.value)} 
                      className="w-12 h-10 border-0 cursor-pointer"
                    />
                    <Input 
                      value={uiSettings.flat_color}
                      onChange={(e) => handleColorChange('flat-color', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <ColorPreview 
                    background={uiSettings.flat_color}
                    foreground={uiSettings.foreground_color}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="foreground">
              <div className="space-y-4">
                <div className="text-white font-medium">Text Color</div>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    id="foreground-color"
                    value={uiSettings.foreground_color} 
                    onChange={(e) => handleColorChange('foreground-color', e.target.value)} 
                    className="w-12 h-10 border-0 cursor-pointer"
                  />
                  <Input 
                    value={uiSettings.foreground_color}
                    onChange={(e) => handleColorChange('foreground-color', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <ColorPreview 
                  background={uiSettings.ui_mode === 'fun' 
                    ? `linear-gradient(to right, ${uiSettings.gradient_from}, ${uiSettings.gradient_via}, ${uiSettings.gradient_to})`
                    : uiSettings.flat_color
                  }
                  foreground={uiSettings.foreground_color}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="text-sm font-medium text-red-300">{error}</div>
          )}
          {message && (
            <div className="text-sm font-medium text-green-300">{message}</div>
          )}
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              onClick={handleResetSettings}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <Button 
              type="submit" 
              className={`flex-1 ${hasUnsavedChanges ? 'bg-amber-500/50 hover:bg-amber-500/70' : 'bg-white/20 hover:bg-white/30'} text-white`}
              disabled={saving || !hasUnsavedChanges}
            >
              {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes to Save'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t border-white/10 pt-4 p-6">
        <div className="text-xs text-white/60 w-full">
          Changes are applied immediately. Click Save to make them permanent.
        </div>
      </CardFooter>
    </Card>
  )
} 