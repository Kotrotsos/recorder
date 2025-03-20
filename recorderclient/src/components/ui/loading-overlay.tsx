"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useLoading } from '@/contexts/loading-context';
import { useUISettings } from '@/contexts/ui-settings-context';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  children: ReactNode;
  fullHeight?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  children, 
  fullHeight = false 
}) => {
  const { isLoading } = useLoading();
  const { uiSettings } = useUISettings();
  const [showChildren, setShowChildren] = useState(false);

  // Only show children after loading completes
  useEffect(() => {
    if (!isLoading) {
      setShowChildren(true);
    }
  }, [isLoading]);

  // Generate background style based on UI settings
  const generateBackgroundStyle = () => {
    if (uiSettings.ui_mode === 'fun') {
      const from = String(uiSettings.gradient_from || '');
      const via = String(uiSettings.gradient_via || '');
      const to = String(uiSettings.gradient_to || '');
      
      return {
        backgroundImage: `linear-gradient(to bottom right, ${from}, ${via}, ${to})`,
        backgroundSize: '200% 200%',
        animation: 'gradientShift 15s ease infinite'
      };
    } else {
      return {
        backgroundColor: String(uiSettings.flat_color || ''),
        backgroundImage: 'none'
      };
    }
  };

  // Generate text color style
  const textColorStyle = {
    color: String(uiSettings.foreground_color || '#ffffff')
  };

  return (
    <div className={cn("relative", fullHeight && "h-full")}>
      {showChildren && children}
      
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
          style={generateBackgroundStyle()}
        >
          <div className="flex flex-col items-center gap-2">
            <div 
              className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: `${uiSettings.foreground_color} transparent ${uiSettings.foreground_color} ${uiSettings.foreground_color}` }}
            ></div>
            <p style={textColorStyle} className="text-sm">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}; 