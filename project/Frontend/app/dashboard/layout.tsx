import type React from "react"
import { currentUser } from "@clerk/nextjs/server"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { UserSync } from "@/components/user-sync"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const userName = user?.firstName || "User"

  const hour = new Date().getHours()
  let greeting = "Good evening"
  if (hour < 12) greeting = "Good morning"
  else if (hour < 17) greeting = "Good afternoon"

  return (
    <div className="flex min-h-screen">
      <UserSync />
      <DashboardSidebar />
      <div className="flex-1 pl-20">
        <DashboardHeader userName={userName} greeting={greeting} />
        {children}
      </div>
    </div>
  )
}
