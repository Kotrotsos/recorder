"use client"

import UserProfile from '@/components/auth/user-profile'
import ProtectedRoute from '@/components/auth/protected-route'
import AuthLayout from '@/components/auth/auth-layout'
import WebhookSettings from '@/components/auth/webhook-settings'
import UISettings from '@/components/auth/ui-settings'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AuthLayout title="Your Account" description="Manage your profile and settings">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            <UserProfile />
            <WebhookSettings />
            <UISettings />
          </div>
        </div>
      </AuthLayout>
    </ProtectedRoute>
  )
} 