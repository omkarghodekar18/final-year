"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
  Briefcase,
  Calendar,
  MessageSquare,
} from "lucide-react"

interface UpskillTopic {
  skill: string
  reason: string
  resources: string[]
}

interface InterviewFeedback {
  id: string
  jobTitle: string
  company: string
  date: string
  overallRating: "Strong" | "Good" | "Needs Work"
  summary: string
  strengths: string[]
  improvements: string[]
  upskillPlan: UpskillTopic[]
}

// Placeholder data — will be replaced with real AI-generated feedback per interview
const PAST_INTERVIEWS: InterviewFeedback[] = [
  {
    id: "1",
    jobTitle: "Frontend Developer",
    company: "TechCorp",
    date: "2026-02-20",
    overallRating: "Good",
    summary:
      "You demonstrated solid React knowledge and communicated your thought process clearly. A few answers lacked depth on system-level thinking.",
    strengths: [
      "Strong command of React hooks and state management",
      "Clear communication style with good examples",
      "Showed genuine enthusiasm for the role",
    ],
    improvements: [
      "Answers on CSS performance optimization were surface-level",
      "Could structure behavioral answers using STAR method more consistently",
    ],
    upskillPlan: [
      {
        skill: "CSS Performance",
        reason: "Struggled with browser rendering pipeline questions",
        resources: ["web.dev/performance", "CSS Tricks — Critical Rendering Path"],
      },
      {
        skill: "Behavioral Interviewing (STAR)",
        reason: "Answers lacked structured storytelling",
        resources: ["STAR Method Guide — Indeed", "Pramp mock behavioral interviews"],
      },
    ],
  },
  {
    id: "2",
    jobTitle: "Full Stack Engineer",
    company: "StartupXYZ",
    date: "2026-02-14",
    overallRating: "Needs Work",
    summary:
      "Backend questions around database design exposed gaps in SQL knowledge. Frontend section was handled well. Need to focus on system design fundamentals.",
    strengths: [
      "Confident on the frontend — React, Next.js routing, and API integration",
      "Good problem decomposition for UI tasks",
    ],
    improvements: [
      "Database normalization and indexing answers were incomplete",
      "Struggled to scale a system beyond a basic CRUD design",
      "Didn't ask clarifying questions during system design",
    ],
    upskillPlan: [
      {
        skill: "SQL & Database Design",
        reason: "Weak on normalization, indexing, and query optimization",
        resources: ["SQLZoo interactive exercises", "Use The Index, Luke (book)"],
      },
      {
        skill: "System Design",
        reason: "Could not scale a design beyond simple CRUD",
        resources: ["System Design Primer — GitHub", "Grokking the System Design Interview"],
      },
    ],
  },
  {
    id: "3",
    jobTitle: "Junior Software Engineer",
    company: "GlobalFinance",
    date: "2026-02-08",
    overallRating: "Strong",
    summary:
      "Excellent overall performance. Algorithms were solved efficiently with clear explanations. Behavioral round was your strongest — specific examples, good reflection.",
    strengths: [
      "Solved two medium LeetCode problems optimally with explanation",
      "Strong behavioral answers with concrete examples",
      "Asked excellent questions about team culture and tech stack",
    ],
    improvements: [
      "Minor: one answer on Big-O analysis was slightly off — review space complexity",
    ],
    upskillPlan: [
      {
        skill: "Space Complexity Analysis",
        reason: "One subtle mistake in Big-O space analysis",
        resources: ["NeetCode.io Big-O refresher", "CS Dojo — Space Complexity video"],
      },
    ],
  },
]

const ratingConfig = {
  Strong: { class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500" },
  Good: { class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", dot: "bg-blue-500" },
  "Needs Work": { class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
}

function InterviewFeedbackCard({ interview }: { interview: InterviewFeedback }) {
  const [expanded, setExpanded] = useState(false)
  const rating = ratingConfig[interview.overallRating]
  const dateLabel = new Date(interview.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <Card className="transition-shadow hover:shadow-md">
      {/* Header — always visible */}
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Briefcase className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{interview.jobTitle}</CardTitle>
              <CardDescription className="truncate">{interview.company}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" /> {dateLabel}
            </span>
            <Badge className={`text-xs font-medium ${rating.class}`}>
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${rating.dot} inline-block`} />
              {interview.overallRating}
            </Badge>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>

      {/* Expanded content */}
      {expanded && (
        <CardContent className="space-y-6 pt-0">
          {/* Summary */}
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              AI Summary
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{interview.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Strengths */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" /> Strengths
              </h4>
              <ul className="space-y-2">
                {interview.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                <Lightbulb className="h-4 w-4" /> Areas to Improve
              </h4>
              <ul className="space-y-2">
                {interview.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI Interview Feedback</h1>
            <p className="mt-1 text-muted-foreground">
              Personalized feedback and upskilling plans from your past interviews
            </p>
          </div>
        </div>

        {PAST_INTERVIEWS.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold mb-1">No interviews yet</h3>
              <p className="text-sm text-muted-foreground">
                Complete a mock interview to receive AI-generated feedback and an upskilling plan.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {PAST_INTERVIEWS.map((interview) => (
              <InterviewFeedbackCard key={interview.id} interview={interview} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
