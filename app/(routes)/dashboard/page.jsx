"use client"

import React, { useEffect } from 'react'
import { auth, db } from '@/config/firebaseConfig'
import { useAuth } from '@clerk/nextjs'
import { signInWithCustomToken } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'

import WorkspaceList from './_components/WorkspaceList'
import Header from './_components/Header'

function Dashboard() {
  const { getToken, userId } = useAuth()

  // Function to sign in with Clerk token into Firebase
  const signIntoFirebaseWithClerk = async () => {
    try {
      const token = await getToken({ template: 'integration_firebase' })

      // Check if token is valid
      if (!token) {
        throw new Error('No token received from Clerk.')
      }

      const userCredentials = await signInWithCustomToken(auth, token)
      console.log('User:', userCredentials.user)

      // After signing in with Firebase, fetch Clerk session and store it
      const response = await fetch('/api/fetch-session', {
        method: 'POST',  // Changed to POST to send userId in the body
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),  // Send userId as part of the request body
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Session data:', data)
    } catch (error) {
      // Log the error and display a message
      console.error('Error during Firebase sign-in:', error.message)
      alert('Error during sign-in. Please try again later.')
    }
  }

  // Effect hook to sign into Firebase and fetch/store session data
  useEffect(() => {
    if (userId) {
      signIntoFirebaseWithClerk()
    }
  }, [userId])

  if (!userId) {
    return (
      <div>loading...</div>
    )
  } else {
    return (
      <div>
        <Header />
        <WorkspaceList />
      </div>
    )
  }
}

export default Dashboard
