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
import React from 'react'

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
  
  // Local state for UI mode to prevent infinite loops
  const [localUIMode, setLocalUIMode] = useState<'fun' | 'flat'>(uiSettings.ui_mode)
  
  // Color picker states
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null)
  
  // Dialog state
  const [gradientDialogOpen, setGradientDialogOpen] = useState(false)
  
  const supabase = createClient()

  // Sync local UI mode with context
  useEffect(() => {
    // Only update local state if it's different from context to prevent unnecessary re-renders
    if (localUIMode !== uiSettings.ui_mode) {
      setLocalUIMode(uiSettings.ui_mode)
    }
  }, [uiSettings.ui_mode, localUIMode])

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
    const newMode = isChecked ? 'fun' : 'flat'
    setLocalUIMode(newMode) // Update local state first
    updateUISettings({ ui_mode: newMode }) // Then update context
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

  // Generate a gradient preview
  const generateGradientPreview = () => {
    return {
      background: `linear-gradient(to right, ${uiSettings.gradient_from}, ${uiSettings.gradient_via}, ${uiSettings.gradient_to})`
    }
  }

  // Generate a flat color preview
  const generateFlatPreview = () => {
    return {
      background: uiSettings.flat_color
    }
  }

  // Memoize preview styles to prevent unnecessary re-renders
  const gradientPreviewStyle = React.useMemo(() => generateGradientPreview(), [
    uiSettings.gradient_from,
    uiSettings.gradient_via,
    uiSettings.gradient_to
  ])
  
  const flatPreviewStyle = React.useMemo(() => generateFlatPreview(), [
    uiSettings.flat_color
  ])

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Loading...</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-[400px] text-white">Please log in to view your UI settings.</div>
  }

  return (
    <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
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
      <CardContent className="p-6 pt-0 space-y-6">
        <form onSubmit={handleSaveSettings}>
          <div className="space-y-6">
            {/* UI Mode Switch */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">UI Mode</h3>
                  <p className="text-sm text-white/70 mt-1">
                    Choose between a fun gradient or a simple flat color interface
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ui-mode" className="text-white/60">Flat</Label>
                  <Switch 
                    id="ui-mode" 
                    checked={localUIMode === 'fun'}
                    onCheckedChange={handleUIModeChange}
                  />
                  <Label htmlFor="ui-mode" className="text-white">Fun</Label>
                </div>
              </div>
              
              {/* Color Preview */}
              <div className="h-16 rounded-md overflow-hidden">
                <div className="h-full" style={localUIMode === 'fun' ? gradientPreviewStyle : flatPreviewStyle}></div>
              </div>
            </div>
            
            {/* Color Customization Section */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Customize Colors</h3>
              <div className="space-y-4">
                {localUIMode === 'fun' ? (
                  <div className="space-y-4">
                    <Dialog open={gradientDialogOpen} onOpenChange={setGradientDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          type="button"
                          className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white"
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
                          
                          <div className="h-16 rounded-md overflow-hidden">
                            <div className="h-full" style={gradientPreviewStyle}></div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="h-10 rounded-md mb-1" style={{ background: uiSettings.gradient_from }}></div>
                        <p className="text-xs text-center text-white/60">From</p>
                      </div>
                      <div>
                        <div className="h-10 rounded-md mb-1" style={{ background: uiSettings.gradient_via }}></div>
                        <p className="text-xs text-center text-white/60">Via</p>
                      </div>
                      <div>
                        <div className="h-10 rounded-md mb-1" style={{ background: uiSettings.gradient_to }}></div>
                        <p className="text-xs text-center text-white/60">To</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="flat-color" className="text-sm text-white/70">Background Color</Label>
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
                          className="bg-white/10 border-white/20 text-white h-10"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="foreground-color" className="text-sm text-white/70">Text Color</Label>
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
                      className="bg-white/10 border-white/20 text-white h-10"
                    />
                  </div>
                </div>
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
            
            <div className="flex flex-col md:flex-row gap-2 md:justify-between">
              <Button 
                type="button" 
                onClick={handleResetSettings}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 order-2 md:order-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              
              <Button 
                type="submit" 
                className="bg-white/20 hover:bg-white/30 text-white order-1 md:order-2" 
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t border-white/10 pt-4 p-6">
        <div className="text-xs text-white/60 w-full">
          These settings control the visual appearance of your application interface.
        </div>
      </CardFooter>
    </Card>
  )
} 