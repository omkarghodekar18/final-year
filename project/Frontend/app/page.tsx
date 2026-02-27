import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  BarChart3,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto w-full max-w-7xl px-6 flex flex-col items-center gap-8 py-24 md:py-32">
          <div className="flex max-w-4xl flex-col items-center gap-6 text-center">
            <Badge variant="secondary" className="px-4 py-1.5">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text font-semibold text-transparent">
                AI-Powered Interview Preparation
              </span>
            </Badge>
            <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-balance text-5xl font-bold leading-tight tracking-tight text-transparent md:text-6xl lg:text-7xl">
              Ace Your Interviews with AI
            </h1>
            <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              Practice interviews with a real-time AI interviewer, discover jobs matched to your resume, and close your skill gaps — all in one place.
            </p>
          </div>
          <div className="mt-8 w-full max-w-5xl">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted/50">
              <img
                src="/modern-ai-interview-dashboard-interface.jpg"
                alt="SkillsBridge Dashboard"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <Badge variant="secondary">Features</Badge>
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Everything you need to succeed
            </h2>
            <p className="max-w-2xl text-balance text-lg text-muted-foreground">
              Comprehensive tools and insights to help you prepare for any
              interview scenario
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Feedback</CardTitle>
                <CardDescription>
                  Get instant AI-powered feedback on your responses, body
                  language, and communication skills
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multiple Interview Modes</CardTitle>
                <CardDescription>
                  Practice technical, behavioral, system design, and
                  communication interviews
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Track your progress over time with detailed performance
                  metrics and insights
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Personalized Plans</CardTitle>
                <CardDescription>
                  Receive customized improvement recommendations based on your
                  performance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
