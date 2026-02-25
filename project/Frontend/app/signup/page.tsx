"use client"

import Link from "next/link"
import { SignUp } from "@clerk/nextjs"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">SB</span>
            </div>
            <span className="text-2xl font-bold">SkillsBridge</span>
          </Link>
        </div>
        <div className="flex justify-center">
          <SignUp routing="hash" />
        </div>
      </div>
    </div>
  )
}
