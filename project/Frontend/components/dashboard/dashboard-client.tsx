"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  PenTool,
  Star,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const performanceData = [
  { day: "SUN", value: 65 },
  { day: "TUE", value: 85 },
  { day: "WED", value: 90 },
  { day: "THU", value: 75 },
  { day: "FRI", value: 70 },
  { day: "SAT", value: 60 },
  { day: "SUN", value: 80 },
];

export default function DashboardClient() {
  return (
    <main className="min-h-screen bg-background p-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-700">
          Get Early Access
        </Badge>
        <h1 className="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
          Ace Your Interviews with AI
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
          Smart, task focused AI tools designed to boost productivity,
          streamline writing and support your academic and professional goals.
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="mb-8">
        {/* <TabsList className="mb-6 justify-center">
          <TabsTrigger value="all">All Writer</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="writing">Writing & Content</TabsTrigger>
          <TabsTrigger value="ielts">IELTS</TabsTrigger>
          <TabsTrigger value="academic">Academic & Education</TabsTrigger>
          <TabsTrigger value="research">Research & PHD</TabsTrigger>
        </TabsList> */}

        {/* Filter Bar */}
        {/* <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              Tranding
            </Button>
            <Button variant="ghost" size="sm">
              Popular
            </Button>
            <Button variant="ghost" size="sm">
              New
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div> */}

        <TabsContent value="all" className="space-y-8">
          {/* Tool Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-xl">Mock Interview</CardTitle>
                {/* <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                  <span className="font-semibold">4.8</span>
                </div> */}
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Practice real interview questions with AI. Build confidence
                  and improve your answers with instant feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Upskilling</CardTitle>
                {/* <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                  <span className="font-semibold">4.9</span>
                </div> */}
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Identify skill gaps based on job trends and receive
                  personalized learning paths.
                </p>
              </CardContent>
            </Card>

            {/* <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
                  <PenTool className="h-6 w-6 text-cyan-600" />
                </div>
                <CardTitle className="text-xl">Grammar Checker</CardTitle>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                  <span className="font-semibold">4.7</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Instantly correct grammar, punctuation, and sentence
                  structure. Get clear suggestions to improve your writing.
                </p>
              </CardContent>
            </Card> */}
          </div>

          {/* Performance Section */}
          {/* <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Performance</CardTitle>
                    <CardDescription>
                      Total performance progress statas
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    + 235,21%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 text-sm text-muted-foreground">
                      Credit Score
                    </div>
                    <div className="text-3xl font-bold">2,442</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 text-sm text-muted-foreground">
                      Loss Credit Score
                    </div>
                    <div className="text-3xl font-bold">-1,205</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={performanceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      className="text-xs"
                    />
                    <YAxis hide />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">64%</CardTitle>
                <CardDescription>Total Activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>20%</span>
                    <span>35%</span>
                    <span>41%</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full">
                    <div className="bg-purple-500" style={{ width: "20%" }} />
                    <div className="bg-blue-500" style={{ width: "35%" }} />
                    <div className="bg-orange-500" style={{ width: "41%" }} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-sm text-muted-foreground">
                        In Progress
                      </span>
                    </div>
                    <span className="text-2xl font-bold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm text-muted-foreground">
                        Completed
                      </span>
                    </div>
                    <span className="text-2xl font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="text-sm text-muted-foreground">
                        Up Coming
                      </span>
                    </div>
                    <span className="text-2xl font-bold">14</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </TabsContent>
      </Tabs>
    </main>
  );
}
