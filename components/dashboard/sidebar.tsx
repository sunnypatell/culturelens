"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  activeView: string;
  onViewChange: (
    view: "home" | "record" | "library" | "insights" | "settings"
  ) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: HomeIcon,
      description: "Dashboard overview",
    },
    {
      id: "record",
      label: "Record",
      icon: MicIcon,
      description: "Start new session",
    },
    {
      id: "library",
      label: "Library",
      icon: LibraryIcon,
      description: "Browse recordings",
    },
    {
      id: "insights",
      label: "Insights",
      icon: ChartIcon,
      description: "View patterns",
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      description: "Preferences",
    },
  ];

  return (
    <aside className="w-72 border-r border-border bg-gradient-to-b from-card via-card to-muted/20 flex flex-col relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />

      {/* Header */}
      <div className="p-6 border-b border-border/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-11 h-11 rounded-xl bg-linear-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary-foreground"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill="currentColor"
                opacity="0.6"
              />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.7" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              CultureLens
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Understanding Through Listening
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isHovered = hoveredItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Hover effect background */}
              {isHovered && !isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-in fade-in duration-300" />
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
              )}

              <div
                className={cn(
                  "relative z-10 transition-transform duration-300",
                  isActive && "scale-110",
                  isHovered && !isActive && "scale-105"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 text-left relative z-10">
                <span className="block">{item.label}</span>
                {isHovered && (
                  <span className="block text-xs opacity-70 animate-in slide-in-from-left-2 duration-200">
                    {item.description}
                  </span>
                )}
              </div>

              {/* Subtle arrow on hover */}
              <svg
                className={cn(
                  "w-4 h-4 transition-all duration-300 relative z-10",
                  isActive
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                )}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          );
        })}
      </nav>

      {/* Stats Bar */}
      <div className="mx-4 mb-4 p-4 rounded-xl bg-linear-to-br from-primary/10 via-accent/5 to-primary/5 border border-border/50 backdrop-blur-sm relative z-10">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Sessions This Month</span>
            <span className="font-bold text-foreground">12</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-[60%] bg-gradient-to-r from-primary to-accent rounded-full animate-in slide-in-from-left duration-1000" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Insights Gained</span>
            <span className="font-bold text-foreground">47</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border/50 backdrop-blur-sm relative z-10">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-all duration-300 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary via-accent to-primary shadow-md" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-foreground truncate">
              User Profile
            </p>
            <p className="text-xs text-muted-foreground truncate">
              user@example.com
            </p>
          </div>
          <svg
            className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m8.66-13.66l-4.24 4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1m20.66 8.66l-4.24-4.24m-4.24-4.24l-4.24-4.24" />
    </svg>
  );
}
