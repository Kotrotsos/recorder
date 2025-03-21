"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { usePathname } from 'next/navigation'

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

// Add type guard for gradient functions
const isValidGradient = (value: any): value is string => {
  return typeof value === 'string' && value.length > 0
}

// Add type guard for pathname
const isValidPathname = (path: string | null): path is string => {
  return typeof path === 'string'
}

export function UISettingsProvider({ children }: { children: ReactNode }) {
  const [uiSettings, setUiSettings] = useState<UISettings>(defaultSettings)
  const [savedSettings, setSavedSettings] = useState<UISettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastApplied, setLastApplied] = useState<number>(0)
  const appliedRef = useRef<string>('') // Add a ref to track the last applied settings
  const lastAppliedTimeRef = useRef<number>(0) // Add a ref to track the last applied timestamp
  const supabase = createClient()
  const pathname = usePathname()

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
        // Add a small delay before finishing loading to ensure styles get applied
        setTimeout(() => {
          setLoading(false)
        }, 100)
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
    // Don't apply if we're still loading
    if (loading) return
    
    // Ensure this runs in the client
    if (typeof window === 'undefined') return

    // Wait for next tick to ensure DOM is ready
    setTimeout(() => {
      try {
        // Update the last applied timestamp to track when styles were most recently applied
        const now = Date.now()
        setLastApplied(now)
        lastAppliedTimeRef.current = now
        
        const gradientElements = document.querySelectorAll('.gradient-background')
        // Apply styles to all containers that might need the background styling
        const containerSelectors = [
          '.gradient-background',
          '.min-h-screen.flex.flex-col.relative.overflow-hidden',
          '.min-h-screen.flex.flex-col',
          '.min-h-screen'
          // 'main' - removing main from selectors
        ]
        
        // Get all potential containers
        const allContainers = Array.from(
          containerSelectors.flatMap(selector => 
            Array.from(document.querySelectorAll(selector))
          )
        )
        
        // Remove duplicates by creating a Set
        const uniqueContainers = [...new Set(allContainers)]

        // Explicitly remove any main elements that might have been selected
        const containersWithoutMain = uniqueContainers.filter(el => 
          (el as HTMLElement).tagName.toLowerCase() !== 'main'
        );

        if (uiSettings.ui_mode === 'fun') {
          // Apply gradient background
          gradientElements.forEach((el) => {
            if ((el as HTMLElement).tagName.toLowerCase() === 'main') return; // Skip main elements
            
            const element = el as HTMLElement
            // Ensure gradient values are treated as strings
            const from = String(uiSettings.gradient_from || '');
            const via = String(uiSettings.gradient_via || '');
            const to = String(uiSettings.gradient_to || '');
            
            const gradientStyle = `linear-gradient(to bottom right, ${from}, ${via}, ${to})`;
            element.style.background = gradientStyle;
            element.style.backgroundSize = '200% 200%';
            element.style.animation = 'gradientShift 15s ease infinite';
          })

          // Apply to all containers
          containersWithoutMain.forEach(container => {
            if ((container as HTMLElement).tagName.toLowerCase() === 'main') return; // Double-check to skip main elements
            
            const element = container as HTMLElement;
            const from = String(uiSettings.gradient_from || '');
            const via = String(uiSettings.gradient_via || '');
            const to = String(uiSettings.gradient_to || '');
            
            // Only apply if the element doesn't already have a background image
            const currentBackground = element.style.background;
            if (!currentBackground || !currentBackground.includes('url(')) {
              const gradientStyle = `linear-gradient(to bottom right, ${from}, ${via}, ${to})`;
              element.style.background = gradientStyle;
              element.style.backgroundSize = '200% 200%';
              element.style.animation = 'gradientShift 15s ease infinite';
            }
          });
          
          // Explicitly clear backgrounds on all main elements
          document.querySelectorAll('main').forEach(mainEl => {
            const element = mainEl as HTMLElement;
            element.style.background = 'transparent';
            element.style.backgroundSize = 'auto';
            element.style.animation = 'none';
          });
        } else {
          // Apply flat background
          gradientElements.forEach((el) => {
            if ((el as HTMLElement).tagName.toLowerCase() === 'main') return; // Skip main elements
            
            const element = el as HTMLElement
            element.style.background = String(uiSettings.flat_color || '');
            
            // Clear animation properties for flat mode
            element.style.backgroundSize = 'auto'
            element.style.animation = 'none'
          })

          // Apply to all containers
          containersWithoutMain.forEach(container => {
            if ((container as HTMLElement).tagName.toLowerCase() === 'main') return; // Double-check to skip main elements
            
            const element = container as HTMLElement;
            // Only apply if the element doesn't already have a background image
            const currentBackground = element.style.background;
            if (!currentBackground || !currentBackground.includes('url(')) {
              element.style.background = String(uiSettings.flat_color || '');
              element.style.backgroundSize = 'auto';
              element.style.animation = 'none';
            }
          });
          
          // Explicitly clear backgrounds on all main elements
          document.querySelectorAll('main').forEach(mainEl => {
            const element = mainEl as HTMLElement;
            element.style.background = 'transparent';
            element.style.backgroundSize = 'auto';
            element.style.animation = 'none';
          });
        }
        
        // Apply foreground color to text elements
        document.querySelectorAll('.text-white, .text-white\\70, .text-white\\60, h1, h2, h3, h4, h5, h6, p, span, label, a').forEach((el) => {
          // Check if the element has a text color class that should be affected
          const classList = (el as HTMLElement).classList;
          const shouldApplyColor = Array.from(classList).some(cls => 
            cls.includes('text-white') || 
            !cls.includes('text-') // Apply to elements with no specific text color class
          );
          
          if (shouldApplyColor) {
            (el as HTMLElement).style.color = String(uiSettings.foreground_color || '');
          }
        })
        
        // Force a reflow to ensure styles are applied
        document.body.offsetHeight
      } catch (error) {
        console.error('Error applying UI settings:', error)
      }
    }, 0)
  }
  
  // Apply settings on initial load and when settings change
  useEffect(() => {
    if (!loading) {
      // Create a stringified version of the current settings
      const settingsKey = JSON.stringify(uiSettings)
      
      // Only apply if settings have changed or haven't been applied yet
      if (settingsKey !== appliedRef.current) {
        const timeoutId = setTimeout(() => {
          applyUISettings()
          appliedRef.current = settingsKey // Update the ref after applying
        }, 100) // Add a small delay to batch potential rapid changes
        
        return () => clearTimeout(timeoutId)
      }
    }
  }, [loading, uiSettings]) // Use the actual uiSettings object, but control application with the ref

  // Apply settings when the pathname changes, for all pages
  useEffect(() => {
    if (pathname && !loading) {
      // Apply immediately and then again after a short delay for dynamic content
      applyUISettings()
      
      const timeoutId = setTimeout(() => {
        applyUISettings()
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [pathname, loading])

  // Periodically reapply styles on all pages
  // This helps catch any cases where styles weren't properly applied
  useEffect(() => {
    if (loading) return

    // Set up a check every 500ms for the first 3 seconds
    const intervalId = setInterval(() => {
      // Only reapply if it's been more than 300ms since the last application
      if (Date.now() - lastAppliedTimeRef.current > 300) {
        applyUISettings()
      }
    }, 500)

    // Clear after 3 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId)
    }, 3000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [loading, pathname])

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