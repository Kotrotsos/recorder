"use client"

import React, { useEffect, useState, CSSProperties } from 'react'
import { useLoading } from '@/contexts/loading-context'
import { LoadingSpinner } from './loading-spinner'

interface LoadingOverlayProps {
  children: React.ReactNode
  fullHeight?: boolean
}

export function LoadingOverlay({ 
  children,
  fullHeight = false
}: LoadingOverlayProps) {
  const { isLoading } = useLoading()
  // Use state to ensure consistent rendering between server and client
  const [isMounted, setIsMounted] = useState(false)
  
  // Only enable client-side features after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Base styles that will be consistently rendered on both server and client
  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: '0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    opacity: 1,
    transition: 'opacity 0.3s ease-in-out',
    backdropFilter: isMounted ? 'blur(8px)' : 'none', // Only apply blur after client-side mount
  }
  
  // Content styles
  const contentStyle: CSSProperties = { 
    opacity: isLoading ? 0 : 1, 
    transition: 'opacity 0.3s ease-in-out',
    visibility: isLoading ? 'hidden' : 'visible' as const,
  }
  
  return (
    <div style={{ position: 'relative', height: fullHeight ? '100%' : 'auto' }}>
      {/* Loading overlay */}
      {isLoading && (
        <div style={overlayStyle}>
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner size="large" className="text-white" />
            <p style={{ 
              marginTop: '1rem', 
              fontSize: '0.875rem', 
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Loading content...
            </p>
          </div>
        </div>
      )}
      
      {/* Content area - hidden while loading */}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  )
} 