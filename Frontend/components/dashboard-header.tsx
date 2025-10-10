"use client";

import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  greeting?: string;
  userName?: string;
  subtitle?: string;
}

export function DashboardHeader({
  greeting = "Good morning",
  userName = "Omkar",
  subtitle = "How can we assit you to day?",
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {userName}!
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <Button variant="ghost" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src="/placeholder.svg?height=32&width=32"
              alt={userName}
            />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{userName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
