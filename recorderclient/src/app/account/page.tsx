"use client"

import UserProfile from '@/components/auth/user-profile'
import ProtectedRoute from '@/components/auth/protected-route'
import AuthLayout from '@/components/auth/auth-layout'
import WebhookSettings from '@/components/auth/webhook-settings'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AuthLayout title="Your Account" description="Manage your profile and settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto w-full p-6">
          <div className="order-2 md:order-1">
            <WebhookSettings />
          </div>
          <div className="order-1 md:order-2">
            <UserProfile />
          </div>
        </div>
      </AuthLayout>
    </ProtectedRoute>
  )
} 