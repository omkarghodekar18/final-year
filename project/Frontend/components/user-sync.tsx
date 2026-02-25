"use client"

import { useEffect, useRef } from "react"
import { useUser, useAuth } from "@clerk/nextjs"

/**
 * Invisible component that syncs the signed-in Clerk user
 * to the Flask backend / MongoDB on first load.
 * Mount this inside the dashboard layout.
 */
export function UserSync() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const hasSynced = useRef(false)

  useEffect(() => {
    if (!isLoaded || !user || hasSynced.current) return

    const sync = async () => {
      try {
        const token = await getToken()
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress ?? "",
            first_name: user.firstName ?? "",
            last_name: user.lastName ?? "",
            profile_image_url: user.imageUrl ?? "",
          }),
        })
        hasSynced.current = true
      } catch {
      }
    }

    sync()
  }, [isLoaded, user, getToken])

  return null
}
