"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, MessageSquare, Network, Mic, Search, Clock, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const interviews = [
  {
    id: 1,
    title: "React Fundamentals",
    category: "Technical",
    description: "Test your knowledge of React hooks, components, and state management",
    difficulty: "Intermediate",
    duration: "30 min",
    icon: Code,
    rating: 4.8,
  },
  {
    id: 2,
    title: "Leadership & Teamwork",
    category: "Behavioral",
    description: "Practice answering questions about team collaboration and leadership experiences",
    difficulty: "Beginner",
    duration: "25 min",
    icon: MessageSquare,
    rating: 4.9,
  },
  {
    id: 3,
    title: "E-commerce Platform Design",
    category: "System Design",
    description: "Design a scalable e-commerce system with payment processing and inventory management",
    difficulty: "Advanced",
    duration: "45 min",
    icon: Network,
    rating: 4.7,
  },
  {
    id: 4,
    title: "Presentation Skills",
    category: "Communication",
    description: "Improve your ability to present ideas clearly and confidently",
    difficulty: "Beginner",
    duration: "20 min",
    icon: Mic,
    rating: 4.6,
  },
  {
    id: 5,
    title: "Node.js Backend Development",
    category: "Technical",
    description: "Answer questions about Node.js, Express, and RESTful API design",
    difficulty: "Advanced",
    duration: "40 min",
    icon: Code,
    rating: 4.8,
  },
  {
    id: 6,
    title: "Conflict Resolution",
    category: "Behavioral",
    description: "Practice handling difficult situations and resolving workplace conflicts",
    difficulty: "Intermediate",
    duration: "30 min",
    icon: MessageSquare,
    rating: 4.5,
  },
]

export default function InterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch = interview.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || interview.category === categoryFilter
    const matchesDifficulty = difficultyFilter === "all" || interview.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "Advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getIconBg = (index: number) => {
    const colors = ["bg-pink-100", "bg-blue-100", "bg-purple-100", "bg-cyan-100", "bg-orange-100", "bg-green-100"]
    return colors[index % colors.length]
  }

  const getIconColor = (index: number) => {
    const colors = [
      "text-pink-600",
      "text-blue-600",
      "text-purple-600",
      "text-cyan-600",
      "text-orange-600",
      "text-green-600",
    ]
    return colors[index % colors.length]
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold">Interview Library</h2>
        <p className="text-muted-foreground">Choose from our collection of AI-powered mock interviews</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search interviews..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Behavioral">Behavioral</SelectItem>
            <SelectItem value="System Design">System Design</SelectItem>
            <SelectItem value="Communication">Communication</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interview Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredInterviews.map((interview, index) => {
          const Icon = interview.icon
          return (
            <Card key={interview.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getIconBg(index)}`}>
                    <Icon className={`h-6 w-6 ${getIconColor(index)}`} />
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(interview.difficulty)}>
                    {interview.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{interview.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                  <span className="font-semibold">{interview.rating}</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-2 leading-relaxed">{interview.description}</CardDescription>
                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{interview.duration}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {interview.category}
                  </Badge>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/interviews/${interview.id}`}>Start Interview</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredInterviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">No interviews found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
        </div>
      )}
    </main>
  )
}
