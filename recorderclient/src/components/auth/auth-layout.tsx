"use client";

import { useEffect, ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  // Add a style tag for the animation
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Define the animations
    styleEl.innerHTML = `
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      .animated-gradient {
        background-size: 200% 200%;
        animation: gradientShift 15s ease infinite;
      }
      
      @keyframes float1 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-10px, 10px) scale(1.05); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes float2 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(10px, -10px) scale(1.05); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes float3 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-15px, -5px) scale(1.03); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes float4 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(15px, 5px) scale(1.03); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      .blob1 {
        animation: float1 20s ease-in-out infinite;
      }
      
      .blob2 {
        animation: float2 25s ease-in-out infinite;
      }
      
      .blob3 {
        animation: float3 18s ease-in-out infinite;
      }
      
      .blob4 {
        animation: float4 22s ease-in-out infinite;
      }
    `;
    
    // Add the style element to the head
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 animated-gradient">
      {/* Fancy background elements with subtle animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-3xl blob1"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl blob2"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl blob3"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl blob4"></div>
      </div>
      
      {/* Navigation bar */}
      <header className="relative z-10 px-6 py-4 flex justify-between items-center">
        <div className="text-white font-bold text-2xl">
          <Link href="/">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">rec.ai</span>
          </Link>
        </div>
        <nav className="flex items-center">
          <ul className="flex items-center space-x-6 text-sm font-medium text-white/80">
            <li className="flex items-center"><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            <li className="flex items-center"><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
          </ul>
        </nav>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-10">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-center text-white mb-6">{title}</h1>
          {description && <p className="text-lg text-white/80 text-center mb-6">{description}</p>}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 shadow-xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 