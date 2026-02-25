"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Video, VideoOff, MessageSquare, Send, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LiveInterviewPage() {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [response, setResponse] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I'm your AI interviewer. Let's start with a simple question: Can you tell me about yourself?",
      timestamp: "10:00 AM",
    },
  ])

  const totalQuestions = 5
  const progress = (currentQuestion / totalQuestions) * 100

  const handleSendResponse = () => {
    if (response.trim()) {
      setMessages([
        ...messages,
        {
          role: "user",
          content: response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        {
          role: "ai",
          content:
            "Great answer! Let me ask you a follow-up question: What are your greatest strengths and how do they relate to this position?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setResponse("")
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Bar */}
      <div className="border-b border-border/50 bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/interviews">
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">React Fundamentals Interview</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  Technical
                </Badge>
                <span>•</span>
                <span>30 minutes</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Save & Exit
            </Button>
            <Button variant="destructive" size="sm">
              End Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-border/50 bg-card px-6 py-3">
        <div className="container">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              Question {currentQuestion} of {totalQuestions}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex flex-1 gap-6 py-6">
        {/* Video Section */}
        <div className="flex flex-1 flex-col gap-4">
          <Card className="flex-1 border-border/50">
            <CardContent className="flex h-full items-center justify-center p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <img src="/professional-video-call-interface.jpg" alt="Video feed" className="h-full w-full object-cover" />
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  <Button
                    size="icon"
                    variant={isMicOn ? "default" : "destructive"}
                    className="h-12 w-12 rounded-full"
                    onClick={() => setIsMicOn(!isMicOn)}
                  >
                    {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant={isVideoOn ? "default" : "destructive"}
                    className="h-12 w-12 rounded-full"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Feedback */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium">Real-time Feedback</p>
                  <p className="text-sm text-muted-foreground">
                    Good eye contact! Try to speak a bit slower and pause between key points.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Section */}
        <div className="flex w-96 flex-col">
          <Card className="flex flex-1 flex-col border-border/50">
            <CardContent className="flex flex-1 flex-col p-0">
              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((message, i) => (
                  <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p
                        className={`mt-1 text-xs ${
                          message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-border/50 p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your response..."
                    className="min-h-[80px] resize-none"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendResponse()
                      }
                    }}
                  />
                  <Button size="icon" className="shrink-0" onClick={handleSendResponse}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
