// app/api/fetch-session/route.js

import { db } from '@/config/firebaseConfig'
import { auth, currentUser } from '@clerk/nextjs/server'
import { setDoc, doc } from 'firebase/firestore'

export async function POST(request) {
    try {
        const { userId } = await request.json()  // Get userId from request body

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const user = await currentUser()
        const sessionActivity = user?.sessionActivity

        if (!sessionActivity) {
            return new Response(JSON.stringify({ error: 'No session activity found' }), { status: 404 })
        }

        // Store session data in Firestore
        await setDoc(doc(db, 'user_logs', userId), {
            browserName: sessionActivity.browserName,
            browserVersion: sessionActivity.browserVersion,
            deviceType: sessionActivity.deviceType,
            ipAddress: sessionActivity.ipAddress,
            city: sessionActivity.city,
            country: sessionActivity.country,
            isMobile: sessionActivity.isMobile,
            lastActiveAt: sessionActivity.lastActiveAt,
            expireAt: sessionActivity.expireAt
        })

        return new Response(JSON.stringify({ success: 'Session data saved successfully' }))
    } catch (error) {
        console.error('Error fetching/storing session data:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
}
