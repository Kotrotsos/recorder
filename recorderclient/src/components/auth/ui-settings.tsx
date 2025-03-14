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

  // Color picker component with draggable functionality
  const ColorPickerPopover = ({ 
    color, 
    onChange, 
    label, 
    id 
  }: { 
    color: string, 
    onChange: (color: string) => void, 
    label: string, 
    id: string 
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white">{label}</Label>
      <div className="flex items-center gap-2">
        <Popover open={activeColorPicker === id} onOpenChange={(isOpen: boolean) => setActiveColorPicker(isOpen ? id : null)}>
          <PopoverTrigger asChild>
            <Button 
              id={id}
              type="button" 
              variant="outline" 
              className="w-10 h-10 p-0 border-2"
              style={{ backgroundColor: color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker 
              color={color} 
              onChange={(newColor) => onChange(newColor)} 
            />
            <div className="mt-2">
              <Input 
                value={color} 
                onChange={(e) => onChange(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Input 
          value={color} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
    </div>
  )

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
                  <div className="text-white font-medium">Gradient Colors</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ColorPickerPopover 
                      id="gradient-from"
                      label="From Color" 
                      color={uiSettings.gradient_from} 
                      onChange={(color) => handleColorChange('gradient-from', color)}
                    />
                    <ColorPickerPopover 
                      id="gradient-via"
                      label="Via Color" 
                      color={uiSettings.gradient_via} 
                      onChange={(color) => handleColorChange('gradient-via', color)}
                    />
                    <ColorPickerPopover 
                      id="gradient-to"
                      label="To Color" 
                      color={uiSettings.gradient_to} 
                      onChange={(color) => handleColorChange('gradient-to', color)}
                    />
                  </div>
                  <ColorPreview 
                    background={`linear-gradient(to right, ${uiSettings.gradient_from}, ${uiSettings.gradient_via}, ${uiSettings.gradient_to})`}
                    foreground={uiSettings.foreground_color}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-white font-medium">Flat Color</div>
                  <ColorPickerPopover 
                    id="flat-color"
                    label="Background Color" 
                    color={uiSettings.flat_color} 
                    onChange={(color) => handleColorChange('flat-color', color)}
                  />
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
                <ColorPickerPopover 
                  id="foreground-color"
                  label="Text Color" 
                  color={uiSettings.foreground_color} 
                  onChange={(color) => handleColorChange('foreground-color', color)}
                />
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