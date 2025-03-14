"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUISettings } from './ui-settings-context'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setIsLoading: () => {}
})

export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { loading: uiSettingsLoading, applyUISettings } = useUISettings()
  
  // Monitor route changes to trigger loading state
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true)
    }
    
    // Handle when styles are ready to be applied after navigation
    const handleRouteChangeComplete = () => {
      // Short delay to ensure all DOM elements are ready
      setTimeout(() => {
        try {
          // Re-apply UI settings to ensure styles are properly applied
          applyUISettings()
          
          // Give a small delay to ensure styles are applied before showing content
          setTimeout(() => {
            setIsLoading(false)
          }, 150)
        } catch (error) {
          console.error('Error applying UI settings during route change:', error)
          // Ensure we don't get stuck in loading state if there's an error
          setIsLoading(false)
        }
      }, 50)
    }

    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Safety timeout triggered to prevent infinite loading')
        setIsLoading(false)
      }
    }, 5000) // 5 seconds maximum loading time

    // Next.js doesn't have built-in router events like the older pages router
    // But we can monitor when navigation happens by patching router.push
    const originalPush = router.push
    router.push = (...args) => {
      handleRouteChangeStart()
      return originalPush(...args)
    }

    // Initialize loading state based on UI settings loading
    if (!uiSettingsLoading) {
      // Only set to false initially if UI settings are already loaded
      setTimeout(() => {
        setIsLoading(false)
      }, 200)
    }

    return () => {
      // Restore original function
      router.push = originalPush
      // Clear the safety timeout
      clearTimeout(safetyTimeout)
    }
  }, [router, applyUISettings, uiSettingsLoading, isLoading])
  
  // When pathname changes, update our loading state too
  useEffect(() => {
    // When path changes, we're on a new page, so apply settings again
    if (!uiSettingsLoading) {
      try {
        applyUISettings()
      } catch (error) {
        console.error('Error applying UI settings on path change:', error)
      }
    }
  }, [pathname, applyUISettings, uiSettingsLoading])
  
  // When UI settings loading changes, update our loading state
  useEffect(() => {
    if (uiSettingsLoading) {
      setIsLoading(true)
    } else {
      try {
        // Apply settings and then set loading to false after a delay
        applyUISettings()
        setTimeout(() => {
          setIsLoading(false)
        }, 200)
      } catch (error) {
        console.error('Error applying UI settings when UI settings loading changes:', error)
        // Ensure we don't get stuck in loading state if there's an error
        setIsLoading(false)
      }
    }
  }, [uiSettingsLoading, applyUISettings])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  )
} 