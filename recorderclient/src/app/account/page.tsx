"use client"

import { useState } from 'react'
import UserProfile from '@/components/auth/user-profile'
import ProtectedRoute from '@/components/auth/protected-route'
import AuthLayout from '@/components/auth/auth-layout'
import WebhookSettings from '@/components/auth/webhook-settings'
import UISettings from '@/components/auth/ui-settings'
import CustomPrompts from '@/components/auth/custom-prompts'
import { useAuth } from '@/contexts/auth-context'

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState<string>('profile')
  const { user } = useAuth()
  
  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return user ? <UserProfile user={user} /> : null
      case 'webhooks':
        return user ? <WebhookSettings user={user} /> : null
      case 'ui':
        return <UISettings />
      case 'prompts':
        return user ? <CustomPrompts user={user} /> : null
      default:
        return user ? <UserProfile user={user} /> : null
    }
  }
  
  return (
    <ProtectedRoute>
      <AuthLayout title="Account management" description="Make changes to your personal information or account type.">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="md:w-64 w-full space-y-1">
            <div className="backdrop-blur-sm bg-white/5 border-0 shadow-lg rounded-lg overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-medium text-white">Settings</h3>
              </div>
              <nav className="flex flex-col p-2">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`text-left px-4 py-3 rounded-md flex items-center transition-colors ${
                    activeSection === 'profile' 
                      ? 'bg-white/15 text-white font-medium' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Edit profile
                </button>
                <button
                  onClick={() => setActiveSection('webhooks')}
                  className={`text-left px-4 py-3 rounded-md flex items-center transition-colors ${
                    activeSection === 'webhooks' 
                      ? 'bg-white/15 text-white font-medium' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Webhooks
                </button>
                <button
                  onClick={() => setActiveSection('prompts')}
                  className={`text-left px-4 py-3 rounded-md flex items-center transition-colors ${
                    activeSection === 'prompts' 
                      ? 'bg-white/15 text-white font-medium' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Custom Prompts
                </button>
                <button
                  onClick={() => setActiveSection('ui')}
                  className={`text-left px-4 py-3 rounded-md flex items-center transition-colors ${
                    activeSection === 'ui' 
                      ? 'bg-white/15 text-white font-medium' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  UI settings
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {renderSection()}
          </div>
        </div>
      </AuthLayout>
    </ProtectedRoute>
  )
} 