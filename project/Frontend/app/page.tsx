import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
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
              Practice with AI-powered mock interviews, get real-time feedback,
              and track your progress. Build confidence and land your dream job.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Try Demo</Link>
              </Button>
            </div>
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

        {/* Social Proof
        <section className="border-y border-border/40 bg-muted/30 py-12">
          <div className="mx-auto w-full max-w-7xl px-6">
            <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
              TRUSTED BY PROFESSIONALS AT
            </p>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              {["Google", "Microsoft", "Amazon", "Meta", "Apple"].map(
                (company) => (
                  <div
                    key={company}
                    className="flex items-center justify-center"
                  >
                    <span className="text-xl font-semibold text-muted-foreground/60">
                      {company}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </section> */}

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

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="border-y border-border/40 bg-muted/30 py-24"
        >
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="mb-16 flex flex-col items-center gap-4 text-center">
              <Badge variant="secondary">Testimonials</Badge>
              <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Loved by job seekers
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Sarah Chen",
                  role: "Software Engineer at Google",
                  content:
                    "SkillsBridge helped me prepare for my Google interview. The AI feedback was incredibly accurate and helped me improve my communication skills.",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Product Manager at Meta",
                  content:
                    "The behavioral interview practice was a game-changer. I felt so much more confident going into my actual interviews.",
                },
                {
                  name: "Emily Watson",
                  role: "Data Scientist at Amazon",
                  content:
                    "The analytics dashboard showed me exactly where I needed to improve. I landed my dream job within 2 months!",
                },
              ].map((testimonial, i) => (
                <Card key={i} className="border-border/50">
                  <CardHeader>
                    <div className="mb-4 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-4 w-4 fill-primary text-primary"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {testimonial.content}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        {/* <section id="pricing" className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <Badge variant="secondary">Pricing</Badge>
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Choose your plan
            </h2>
            <p className="max-w-2xl text-balance text-lg text-muted-foreground">
              Start free and upgrade as you grow
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for getting started",
                features: [
                  "5 mock interviews per month",
                  "Basic feedback",
                  "Limited analytics",
                  "Community support",
                ],
              },
              {
                name: "Pro",
                price: "$29",
                description: "For serious job seekers",
                features: [
                  "Unlimited mock interviews",
                  "Advanced AI feedback",
                  "Full analytics dashboard",
                  "Personalized improvement plans",
                  "Priority support",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For teams and organizations",
                features: [
                  "Everything in Pro",
                  "Custom interview templates",
                  "Team analytics",
                  "Dedicated account manager",
                  "API access",
                ],
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={
                  plan.popular ? "border-primary shadow-lg" : "border-border/50"
                }
              >
                <CardHeader>
                  {plan.popular && (
                    <Badge className="mb-2 w-fit">Most Popular</Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">
                      {plan.price === "Custom"
                        ? "Contact Sales"
                        : "Get Started"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section> */}

        {/* CTA Section */}
        {/* <section className="border-y border-border/40 bg-muted/30 py-24">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="flex flex-col items-center gap-6 text-center">
              <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Ready to ace your next interview?
              </h2>
              <p className="max-w-2xl text-balance text-lg text-muted-foreground">
                Join thousands of professionals who have improved their
                interview skills with SkillsBridge
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </section> */}
      </main>
      <SiteFooter />
    </div>
  );
}
