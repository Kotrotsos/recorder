"use client";

import React, { ReactNode } from 'react';
import { useLoading } from '@/contexts/loading-context';
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

  return (
    <div className={cn("relative", fullHeight && "h-full")}>
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}; 