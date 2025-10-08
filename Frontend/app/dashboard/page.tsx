"use client";
import { Badge } from "@/components/ui/badge";
import DashboardClient from "@/components/dashboard/dashboard-client";

const performanceData = [
  { day: "SUN", value: 65 },
  { day: "TUE", value: 85 },
  { day: "WED", value: 90 },
  { day: "THU", value: 75 },
  { day: "FRI", value: 70 },
  { day: "SAT", value: 60 },
  { day: "SUN", value: 80 },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      {/* Hero Section */}
      {/* <div className="mb-8 text-center">
        <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500">
          Get Early Access
        </Badge>
        <h1 className="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
          Ace Your Interviews with AI
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
          Smart, task focused AI tools designed to boost productivity, streamline writing and support your academic and
          professional goals.
        </p>
      </div> */}

      {/* Category Tabs */}
      <DashboardClient />
    </main>
  );
}
