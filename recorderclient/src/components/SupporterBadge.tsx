"use client";

import { useState, useEffect } from 'react';
import { isLifetimeSupporter } from '@/utils/subscription';

interface SupporterBadgeProps {
  className?: string;
  showText?: boolean;
}

export default function SupporterBadge({ 
  className = '', 
  showText = true 
}: SupporterBadgeProps) {
  const [isSupporter, setIsSupporter] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSupporterStatus = async () => {
      try {
        console.log('SupporterBadge - Checking supporter status');
        setIsLoading(true);
        const supporter = await isLifetimeSupporter();
        console.log('SupporterBadge - Supporter status result:', supporter);
        setIsSupporter(supporter);
      } catch (error) {
        console.error('SupporterBadge - Error checking supporter status:', error);
        setIsSupporter(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSupporterStatus();
  }, []);

  if (isLoading) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse mr-2"></div>
        {showText && <span className="text-gray-400 text-xs font-medium">Checking...</span>}
      </div>
    );
  }

  if (!isSupporter) {
    console.log('SupporterBadge - Not a supporter, returning null');
    return null;
  }

  console.log('SupporterBadge - Is a supporter, showing badge');
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75"></div>
      </div>
      {showText && (
        <span className="ml-2 text-amber-500 text-xs font-medium">
          Lifetime Supporter
        </span>
      )}
    </div>
  );
} 