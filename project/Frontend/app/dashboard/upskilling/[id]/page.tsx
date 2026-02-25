"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Circle,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Target,
  ArrowLeft,
} from "lucide-react"

interface DayTask {
  time: string
  title: string
  description: string
  resource?: string
  duration: string
  done: boolean
}

interface WeekDay {
  day: number
  label: string
  date: string
  theme: string
  tasks: DayTask[]
}

interface SkillPlan {
  skill: string
  color: string
  weeks: { label: string; days: WeekDay[] }[]
}

interface PlanDetail {
  id: string
  jobTitle: string
  company: string
  skills: SkillPlan[]
}

const ALL_PLANS: PlanDetail[] = [
  {
    id: "1",
    jobTitle: "Full Stack Engineer",
    company: "StartupXYZ",
    skills: [
      {
        skill: "SQL & Database Design",
        color: "blue",
        weeks: [
          {
            label: "Week 1 — Fundamentals",
            days: [
              {
                day: 1, label: "Mon", date: "Feb 24",
                theme: "SQL Basics Refresh",
                tasks: [
                  { time: "7:00 AM", title: "Review SELECT, WHERE, JOIN", description: "Revise core SQL query syntax with examples from real datasets.", resource: "SQLZoo.net — SELECT basics", duration: "45 min", done: true },
                  { time: "8:00 AM", title: "Practice 5 easy SQL problems", description: "Solve beginner-level SQL problems on HackerRank.", resource: "HackerRank SQL Easy", duration: "30 min", done: true },
                ],
              },
              {
                day: 2, label: "Tue", date: "Feb 25",
                theme: "Normalization (1NF, 2NF, 3NF)",
                tasks: [
                  { time: "7:00 AM", title: "Read: DB Normalization explained", description: "Understand why normalization matters and how each normal form eliminates redundancy.", resource: "Studytonight — Normalization", duration: "40 min", done: true },
                  { time: "7:45 AM", title: "Practice: Normalize a sample schema", description: "Given a complex denormalized table, break it into 3NF.", duration: "30 min", done: false },
                ],
              },
              {
                day: 3, label: "Wed", date: "Feb 26",
                theme: "Indexing & Query Optimization",
                tasks: [
                  { time: "7:00 AM", title: "Read: How indexes work", description: "Understand B-tree indexes, composite indexes, and when not to index.", resource: "Use The Index, Luke — Ch. 1", duration: "50 min", done: false },
                  { time: "8:00 AM", title: "EXPLAIN ANALYZE practice", description: "Run slow queries with EXPLAIN and identify missing indexes.", resource: "PostgreSQL EXPLAIN docs", duration: "30 min", done: false },
                ],
              },
              {
                day: 4, label: "Thu", date: "Feb 27",
                theme: "Transactions & Concurrency",
                tasks: [
                  { time: "7:00 AM", title: "ACID properties", description: "Understand Atomicity, Consistency, Isolation, Durability with real examples.", duration: "40 min", done: false },
                  { time: "7:45 AM", title: "Read about isolation levels", description: "Understand READ COMMITTED vs SERIALIZABLE and when race conditions occur.", duration: "30 min", done: false },
                ],
              },
              {
                day: 5, label: "Fri", date: "Feb 28",
                theme: "Mock Interview Practice",
                tasks: [
                  { time: "7:00 AM", title: "Solve 3 medium SQL problems", description: "Practice window functions, subqueries, CTEs.", resource: "LeetCode SQL — Medium", duration: "60 min", done: false },
                  { time: "8:15 AM", title: "Explain a schema design out loud", description: "Speak through a blog platform schema — users, posts, comments.", duration: "20 min", done: false },
                ],
              },
            ],
          },
        ],
      },
      {
        skill: "System Design",
        color: "purple",
        weeks: [
          {
            label: "Week 1 — Core Concepts",
            days: [
              {
                day: 1, label: "Mon", date: "Feb 24",
                theme: "Scalability Fundamentals",
                tasks: [
                  { time: "6:30 PM", title: "Read: Horizontal vs Vertical Scaling", description: "Understand when to scale out vs up, and associated trade-offs.", resource: "System Design Primer — GitHub", duration: "45 min", done: false },
                  { time: "7:15 PM", title: "Study: Load Balancers", description: "How round-robin, IP hash, and least connections work.", duration: "30 min", done: false },
                ],
              },
              {
                day: 2, label: "Tue", date: "Feb 25",
                theme: "Caching",
                tasks: [
                  { time: "6:30 PM", title: "Redis use cases", description: "Session caching, rate limiting, leaderboard — when to reach for Redis.", resource: "Redis docs — Use Cases", duration: "40 min", done: false },
                  { time: "7:15 PM", title: "Design a URL shortener (caching layer)", description: "Practice adding a cache layer to a simple system. Sketch the architecture.", duration: "30 min", done: false },
                ],
              },
              {
                day: 3, label: "Wed", date: "Feb 26",
                theme: "Databases at Scale",
                tasks: [
                  { time: "6:30 PM", title: "Read: SQL vs NoSQL trade-offs", description: "When to use Postgres, MongoDB, Cassandra — with reasoning.", resource: "Grokking System Design — Ch. 2", duration: "50 min", done: false },
                  { time: "7:30 PM", title: "Design a chat application", description: "Focus on message storage, delivery, and read receipts.", duration: "30 min", done: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    jobTitle: "Frontend Developer",
    company: "TechCorp",
    skills: [
      {
        skill: "CSS Performance",
        color: "pink",
        weeks: [
          {
            label: "Week 1 — Browser Internals",
            days: [
              {
                day: 1, label: "Mon", date: "Feb 24",
                theme: "Critical Rendering Path",
                tasks: [
                  { time: "8:00 PM", title: "Read: How browsers render pages", description: "DOM → CSSOM → Render tree → Layout → Paint → Composite.", resource: "web.dev — Critical Rendering Path", duration: "40 min", done: true },
                  { time: "8:45 PM", title: "Identify render-blocking resources", description: "Open DevTools on a real site, look at the Waterfall, find blocking CSS/JS.", duration: "20 min", done: true },
                ],
              },
              {
                day: 2, label: "Tue", date: "Feb 25",
                theme: "CSS Optimization",
                tasks: [
                  { time: "8:00 PM", title: "Read: will-change, contain, layers", description: "Understand GPU compositing and how CSS properties trigger layout vs paint.", resource: "CSS Tricks — Performance Properties", duration: "35 min", done: true },
                  { time: "8:40 PM", title: "Audit a page with Lighthouse", description: "Run Lighthouse on a sample project, find CSS performance issues.", duration: "25 min", done: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "3",
    jobTitle: "Junior Software Engineer",
    company: "GlobalFinance",
    skills: [
      {
        skill: "Space Complexity Analysis",
        color: "purple",
        weeks: [
          {
            label: "Week 1 — Big-O Space",
            days: [
              {
                day: 1, label: "Mon", date: "Feb 24",
                theme: "Space vs Time Complexity",
                tasks: [
                  { time: "7:00 AM", title: "Review Big-O space complexity", description: "Differentiate auxiliary space from total space complexity. Review common patterns.", resource: "NeetCode.io Big-O refresher", duration: "30 min", done: false },
                  { time: "7:35 AM", title: "Watch: Space Complexity explained", description: "CS Dojo video walkthrough of space complexity with concrete examples.", resource: "CS Dojo — Space Complexity video", duration: "20 min", done: false },
                ],
              },
              {
                day: 2, label: "Tue", date: "Feb 25",
                theme: "Practice Problems",
                tasks: [
                  { time: "7:00 AM", title: "Solve 3 problems — analyze space", description: "For each LeetCode solution, explicitly state its space complexity and why.", resource: "LeetCode — Arrays & Strings", duration: "45 min", done: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

const colorMap: Record<string, { badge: string; dot: string; bg: string; border: string }> = {
  blue:   { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",     dot: "bg-blue-500",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  purple: { badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", dot: "bg-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  pink:   { badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",     dot: "bg-pink-500",   bg: "bg-pink-500/10",   border: "border-pink-500/20" },
}

function DayCard({ day, color }: { day: WeekDay; color: string }) {
  const [open, setOpen] = useState(day.day <= 2)
  const c = colorMap[color]
  const done = day.tasks.filter((t) => t.done).length
  const total = day.tasks.length

  return (
    <div className={`rounded-xl border ${open ? c.border : "border-border"} transition-all`}>
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
            <span className="text-xs font-bold text-muted-foreground">{day.label}</span>
          </div>
          <div>
            <p className="text-sm font-semibold">{day.theme}</p>
            <p className="text-xs text-muted-foreground">{day.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{done}/{total} done</span>
          <Progress value={(done / total) * 100} className="w-16 h-1.5" />
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="space-y-3 px-4 pb-4">
          {day.tasks.map((task, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                task.done ? "border-border bg-muted/20 opacity-70" : "border-border bg-card"
              }`}
            >
              {task.done
                ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">{task.time}</span>
                  <span className="text-xs text-muted-foreground shrink-0">· {task.duration}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                {task.resource && (
                  <a className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline" href="#">
                    <ExternalLink className="h-3 w-3" /> {task.resource}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function UpskillingDetailPage() {
  const params = useParams()
  const plan = ALL_PLANS.find((p) => p.id === params.id)

  if (!plan) {
    return (
      <main className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Plan not found.</p>
      </main>
    )
  }

  const allTasks = plan.skills.flatMap((s) => s.weeks.flatMap((w) => w.days.flatMap((d) => d.tasks)))
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter((t) => t.done).length

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Back + Header */}
        <div>
          <Link
            href="/dashboard/upskilling"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to plans
          </Link>
          <h1 className="text-3xl font-bold">{plan.jobTitle}</h1>
          <p className="mt-1 text-muted-foreground">{plan.company} · Day-wise upskilling plan</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 text-center">
              <Flame className="mx-auto h-6 w-6 text-orange-500 mb-1" />
              <p className="text-2xl font-bold">{doneTasks}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tasks done</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-primary mb-1" />
              <p className="text-2xl font-bold">{plan.skills.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Skills tracked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <Target className="mx-auto h-6 w-6 text-green-500 mb-1" />
              <p className="text-2xl font-bold">{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Overall progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Per-skill plans */}
        {plan.skills.map((skillPlan) => {
          const c = colorMap[skillPlan.color]
          return (
            <div key={skillPlan.skill} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                <h2 className="text-base font-semibold">{skillPlan.skill}</h2>
              </div>

              {skillPlan.weeks.map((week) => (
                <div key={week.label} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pl-1">
                    {week.label}
                  </p>
                  {week.days.map((day) => (
                    <DayCard key={day.day} day={day} color={skillPlan.color} />
                  ))}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </main>
  )
}
