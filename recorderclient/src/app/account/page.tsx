"use client"

import UserProfile from '@/components/auth/user-profile'
import ProtectedRoute from '@/components/auth/protected-route'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6">Your Account</h1>
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  )
} 