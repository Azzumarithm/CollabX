"use client"

import React, { useEffect } from 'react'
import Header from './_components/Header'
import WorkspaceList from './_components/WorkspaceList'
import { auth, FirebaseUI } from '@/config/firebaseConfig'
import { useAuth } from '@clerk/nextjs'
import { signInWithCustomToken } from 'firebase/auth'


function Dashboard() {
  const { getToken, userId } = useAuth()
  const signIntoFirebaseWithClerk = async () => {
    const token = await getToken({ template: 'integration_firebase' })

    const userCredentials = await signInWithCustomToken(auth, token || '')
    // The userCredentials.user object can call the methods of
    // the Firebase platform as an authenticated user.
    console.log('User:', userCredentials.user)
  }

  useEffect(() => {
    signIntoFirebaseWithClerk()
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