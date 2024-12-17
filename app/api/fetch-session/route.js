
import { db } from '@/config/firebaseConfig'
import { auth, currentUser } from '@clerk/nextjs/server'
import { setDoc, doc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { userId } = await request.json()  // Get userId from request body

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const user = await currentUser()


        return NextResponse.json({ user: user }, { status: 200 })
    } catch (error) {
        console.error('Error fetching/storing session data:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
}
