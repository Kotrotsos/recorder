"use client"

import UserProfile from '@/components/auth/user-profile'
import ProtectedRoute from '@/components/auth/protected-route'
import AuthLayout from '@/components/auth/auth-layout'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AuthLayout title="Your Account" description="Manage your profile and settings">
        <UserProfile />
      </AuthLayout>
    </ProtectedRoute>
  )
} 