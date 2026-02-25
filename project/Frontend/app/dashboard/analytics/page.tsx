"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Award, Target, Clock, CheckCircle2 } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const performanceData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 72 },
  { month: "Mar", score: 78 },
  { month: "Apr", score: 75 },
  { month: "May", score: 82 },
  { month: "Jun", score: 88 },
]

const categoryData = [
  { category: "Technical", score: 85 },
  { category: "Behavioral", score: 78 },
  { category: "System Design", score: 72 },
  { category: "Communication", score: 90 },
]

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold">Analytics & Insights</h2>
        <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+8 this month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5h</div>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <TrendingDown className="h-3 w-3" />
              <span>-2h from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+5% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Breakdown</TabsTrigger>
          <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Trend */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Your average interview scores over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
              <CardDescription>Compare your scores across different interview types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="category" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
              <CardDescription>Detailed breakdown of your interview skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { skill: "Technical Knowledge", score: 85, trend: "up" },
                { skill: "Problem Solving", score: 88, trend: "up" },
                { skill: "Communication", score: 78, trend: "down" },
                { skill: "Confidence", score: 92, trend: "up" },
                { skill: "Time Management", score: 70, trend: "down" },
                { skill: "Body Language", score: 82, trend: "up" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.skill}</span>
                      {item.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Personalized recommendations based on your performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  type: "Strength",
                  title: "Excellent Technical Knowledge",
                  description:
                    "You consistently demonstrate strong understanding of technical concepts. Your explanations are clear and accurate.",
                  color: "green",
                },
                {
                  type: "Improvement",
                  title: "Work on Time Management",
                  description:
                    "You tend to spend too much time on initial questions. Practice pacing yourself to ensure you can address all questions thoroughly.",
                  color: "yellow",
                },
                {
                  type: "Strength",
                  title: "Great Confidence Level",
                  description:
                    "Your body language and tone convey confidence. This helps establish credibility with interviewers.",
                  color: "green",
                },
                {
                  type: "Improvement",
                  title: "Enhance Communication Skills",
                  description:
                    "Try to structure your answers using the STAR method (Situation, Task, Action, Result) for behavioral questions.",
                  color: "yellow",
                },
              ].map((feedback, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        feedback.color === "green" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {feedback.type}
                    </Badge>
                    <h4 className="font-semibold">{feedback.title}</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feedback.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
