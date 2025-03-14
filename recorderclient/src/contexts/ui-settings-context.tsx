"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'

interface UISettings {
  id?: string
  user_id: string
  ui_mode: 'fun' | 'flat'
  gradient_from: string
  gradient_via: string
  gradient_to: string
  flat_color: string
  foreground_color: string
}

interface UISettingsContextType {
  uiSettings: UISettings
  loading: boolean
  applyUISettings: () => void
  updateUISettings: (newSettings: Partial<UISettings>) => void
  saveUISettings: () => Promise<{ success: boolean, message: string }>
  hasUnsavedChanges: boolean
}

const defaultSettings: UISettings = {
  user_id: '',
  ui_mode: 'fun',
  gradient_from: '#4338ca', // indigo-900
  gradient_via: '#6d28d9', // purple-800
  gradient_to: '#be185d', // pink-700
  flat_color: '#4338ca', // indigo-900
  foreground_color: '#ffffff' // white
}

const UISettingsContext = createContext<UISettingsContextType>({
  uiSettings: defaultSettings,
  loading: true,
  applyUISettings: () => {},
  updateUISettings: () => {},
  saveUISettings: async () => ({ success: false, message: 'Not implemented' }),
  hasUnsavedChanges: false
})

export const useUISettings = () => useContext(UISettingsContext)

export function UISettingsProvider({ children }: { children: ReactNode }) {
  const [uiSettings, setUiSettings] = useState<UISettings>(defaultSettings)
  const [savedSettings, setSavedSettings] = useState<UISettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUISettings = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Fetch UI settings from the database
          const { data, error } = await supabase
            .from('ui_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (data && !error) {
            const settings = {
              ...data,
              user_id: user.id,
              // Ensure foreground_color has a default if not in database
              foreground_color: data.foreground_color || defaultSettings.foreground_color
            }
            setUiSettings(settings)
            setSavedSettings(settings)
          } else {
            // If no settings exist, set default with user ID
            const settings = {
              ...defaultSettings,
              user_id: user.id
            }
            setUiSettings(settings)
            setSavedSettings(settings)
          }
        }
      } catch (error) {
        console.error('Error fetching UI settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUISettings()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUISettings()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Check for unsaved changes
  useEffect(() => {
    if (!loading) {
      const hasChanges = 
        uiSettings.ui_mode !== savedSettings.ui_mode ||
        uiSettings.gradient_from !== savedSettings.gradient_from ||
        uiSettings.gradient_via !== savedSettings.gradient_via ||
        uiSettings.gradient_to !== savedSettings.gradient_to ||
        uiSettings.flat_color !== savedSettings.flat_color ||
        uiSettings.foreground_color !== savedSettings.foreground_color
      
      setHasUnsavedChanges(hasChanges)
    }
  }, [uiSettings, savedSettings, loading])

  // Function to update UI settings temporarily (without saving to database)
  const updateUISettings = (newSettings: Partial<UISettings>) => {
    setUiSettings(current => ({
      ...current,
      ...newSettings
    }))
  }

  // Function to save UI settings to the database
  const saveUISettings = async (): Promise<{ success: boolean, message: string }> => {
    if (!uiSettings.user_id) {
      return { success: false, message: 'You must be logged in to save UI settings' }
    }

    try {
      // Check if UI settings already exist for this user
      const { data: existingSettings } = await supabase
        .from('ui_settings')
        .select('id')
        .eq('user_id', uiSettings.user_id)
        .single()

      let result
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('ui_settings')
          .update({
            ui_mode: uiSettings.ui_mode,
            gradient_from: uiSettings.gradient_from,
            gradient_via: uiSettings.gradient_via,
            gradient_to: uiSettings.gradient_to,
            flat_color: uiSettings.flat_color,
            foreground_color: uiSettings.foreground_color,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', uiSettings.user_id)
      } else {
        // Insert new settings
        result = await supabase
          .from('ui_settings')
          .insert({
            user_id: uiSettings.user_id,
            ui_mode: uiSettings.ui_mode,
            gradient_from: uiSettings.gradient_from,
            gradient_via: uiSettings.gradient_via,
            gradient_to: uiSettings.gradient_to,
            flat_color: uiSettings.flat_color,
            foreground_color: uiSettings.foreground_color,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      if (result.error) {
        return { success: false, message: result.error.message }
      }

      // Update saved settings to match current settings
      setSavedSettings({...uiSettings})
      setHasUnsavedChanges(false)
      
      return { success: true, message: 'UI settings saved successfully' }
    } catch (error) {
      console.error('Error saving UI settings:', error)
      return { success: false, message: 'An unexpected error occurred' }
    }
  }

  // Function to apply UI settings to the page
  const applyUISettings = () => {
    // Apply background based on mode
    if (uiSettings.ui_mode === 'fun') {
      // Apply gradient background
      document.querySelectorAll('.animated-gradient').forEach((el) => {
        (el as HTMLElement).style.background = `linear-gradient(to bottom right, ${uiSettings.gradient_from}, ${uiSettings.gradient_via}, ${uiSettings.gradient_to})`
      })
    } else {
      // Apply flat background
      document.querySelectorAll('.animated-gradient').forEach((el) => {
        (el as HTMLElement).style.background = uiSettings.flat_color
      })
    }
    
    // Apply foreground color to text elements
    document.querySelectorAll('.text-white, .text-white\\70, .text-white\\60').forEach((el) => {
      (el as HTMLElement).style.color = uiSettings.foreground_color
    })
  }
  
  // Apply settings on initial load and when settings change
  useEffect(() => {
    if (!loading) {
      applyUISettings()
    }
  }, [loading, uiSettings.ui_mode, uiSettings.gradient_from, uiSettings.gradient_via, uiSettings.gradient_to, uiSettings.flat_color, uiSettings.foreground_color])

  return (
    <UISettingsContext.Provider value={{ 
      uiSettings, 
      loading, 
      applyUISettings, 
      updateUISettings, 
      saveUISettings,
      hasUnsavedChanges
    }}>
      {children}
    </UISettingsContext.Provider>
  )
} 