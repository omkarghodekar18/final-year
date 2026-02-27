"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  FileText,
  Briefcase,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function DashboardClient() {
  return (
    <main className="min-h-screen bg-background p-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-500 dark:border-purple-400/40 dark:bg-purple-400/10 dark:text-purple-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-75 dark:bg-purple-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400" />
          </span>
          Now in Early Access
        </span>
        <h1 className="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
          Land Your Dream Job with AI
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
          Practice interviews with a real-time AI interviewer, discover jobs matched to your resume, and close your skill gaps — all in one place.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Link href="/dashboard/interviews" className="group block">
          <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-pink-400/40 group-hover:border-pink-400/40">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 transition-transform group-hover:scale-110">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle className="text-xl">Mock Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Practice real interview questions with AI. Build confidence
                and improve your answers with instant feedback.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics" className="group block">
          <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-amber-400/40 group-hover:border-amber-400/40">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 transition-transform group-hover:scale-110">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl">AI Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Review AI-generated feedback from your past interviews with
                strengths and areas to improve.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/jobs" className="group block">
          <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-emerald-400/40 group-hover:border-emerald-400/40">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 transition-transform group-hover:scale-110">
                <Briefcase className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Browse AI-matched job recommendations tailored to your
                resume and skill set.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/upskilling" className="group block">
          <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-400/40 group-hover:border-blue-400/40">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Upskilling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Identify skill gaps based on job trends and receive
                personalized learning paths.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
