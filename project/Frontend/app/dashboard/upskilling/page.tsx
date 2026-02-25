"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ChevronRight, Briefcase, Calendar } from "lucide-react"

interface PlanSummary {
  id: string
  jobTitle: string
  company: string
  date: string
  skills: string[]
  totalTasks: number
  doneTasks: number
  color: string
}

const PLANS: PlanSummary[] = [
  {
    id: "1",
    jobTitle: "Full Stack Engineer",
    company: "StartupXYZ",
    date: "2026-02-14",
    skills: ["SQL & Database Design", "System Design"],
    totalTasks: 12,
    doneTasks: 2,
    color: "blue",
  },
  {
    id: "2",
    jobTitle: "Frontend Developer",
    company: "TechCorp",
    date: "2026-02-20",
    skills: ["CSS Performance", "Behavioral Interviewing (STAR)"],
    totalTasks: 8,
    doneTasks: 3,
    color: "pink",
  },
  {
    id: "3",
    jobTitle: "Junior Software Engineer",
    company: "GlobalFinance",
    date: "2026-02-08",
    skills: ["Space Complexity Analysis"],
    totalTasks: 4,
    doneTasks: 0,
    color: "purple",
  },
]

const colorMap: Record<string, { dot: string; badge: string }> = {
  blue:   { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  pink:   { dot: "bg-pink-500",   badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  purple: { dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
}

export default function UpskillingListPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upskilling Plans</h1>
          <p className="mt-1 text-muted-foreground">
            Personalized learning plans generated from each past interview
          </p>
        </div>

        {PLANS.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 mb-4 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold mb-1">No plans yet</h3>
              <p className="text-sm text-muted-foreground">
                Complete a mock interview to get a personalized upskilling plan.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {PLANS.map((plan) => {
              const c = colorMap[plan.color]
              const pct = Math.round((plan.doneTasks / plan.totalTasks) * 100)
              const dateLabel = new Date(plan.date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })

              return (
                <Link key={plan.id} href={`/dashboard/upskilling/${plan.id}`} className="block group">
                  <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Briefcase className="h-5 w-5 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <CardTitle className="text-base">{plan.jobTitle}</CardTitle>
                            <CardDescription>{plan.company}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" /> {dateLabel}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Skills */}
                      <div className="flex flex-wrap gap-2">
                        {plan.skills.map((s) => (
                          <Badge key={s} className={`text-xs ${c.badge}`}>
                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${c.dot} inline-block`} />
                            {s}
                          </Badge>
                        ))}
                      </div>
                      {/* Progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {plan.doneTasks}/{plan.totalTasks} tasks · {pct}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
