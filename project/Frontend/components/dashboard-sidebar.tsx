"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Video, BarChart3, Briefcase, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/interviews", label: "Interviews", icon: Video },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  // { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[72px] flex-col items-center border-r border-sidebar-border bg-sidebar py-6 shadow-sm">
      {/* Logo with vibrant gradient */}
      <Link
        href="/dashboard"
        className="mb-10 flex h-11 w-11 items-center justify-center"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-primary/30 transition-transform hover:scale-105">
          <span className="text-lg font-bold text-white">SB</span>
        </div>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex flex-1 flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md"
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              {/* Tooltip */}
              <span className="absolute left-full ml-4 hidden whitespace-nowrap rounded-lg bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-lg group-hover:block">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section with Theme Toggle */}
      <div className="flex flex-col items-center gap-4">
        <div className="group relative">
          <ThemeToggle />
        </div>

        <Link href="/dashboard/profile" className="group relative">
          <Avatar className="h-10 w-10 border-2 border-sidebar-border transition-all hover:border-primary">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback className="bg-primary/10 text-primary">
              JD
            </AvatarFallback>
          </Avatar>
          <span className="absolute left-full ml-4 hidden whitespace-nowrap rounded-lg bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-lg group-hover:block">
            Profile
          </span>
        </Link>
      </div>
    </aside>
  );
}
