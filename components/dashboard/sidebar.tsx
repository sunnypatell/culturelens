"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useUserStats } from "@/lib/hooks/useUserStats";
import { UserMenu } from "./user-menu";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (
    view: "home" | "record" | "library" | "insights" | "settings"
  ) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { stats, loading } = useUserStats();

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
    <aside className="w-72 border-r border-white/10 bg-gradient-to-b from-background/95 via-background/80 to-background/95 backdrop-blur-xl flex flex-col relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl"
      />

      {/* Header */}
      <div className="p-6 border-b border-white/10 backdrop-blur-sm relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all duration-300"
          >
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
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-50 rounded-xl blur-xl transition-opacity duration-300" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              CultureLens
            </h1>
            <p className="text-xs text-muted-foreground leading-tight flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Understanding Through Listening
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isHovered = hoveredItem === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onClick={() => onViewChange(item.id as any)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                isActive
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xl shadow-primary/30 border border-white/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10"
              )}
            >
              {/* Glassmorphic hover effect */}
              {isHovered && !isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm"
                />
              )}

              {/* Active glow effect */}
              {isActive && (
                <>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-full shadow-lg shadow-white/50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-50 blur-xl" />
                </>
              )}

              <motion.div
                animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.5 }}
                className={cn(
                  "relative z-10 transition-transform duration-300",
                  isActive && "scale-110",
                  isHovered && !isActive && "scale-105"
                )}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              <div className="flex-1 text-left relative z-10">
                <span className="block font-semibold">{item.label}</span>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-xs opacity-70"
                  >
                    {item.description}
                  </motion.span>
                )}
              </div>

              {/* Arrow indicator */}
              <motion.svg
                animate={{
                  x: isActive ? [0, 3, 0] : 0,
                  opacity: isActive || isHovered ? 1 : 0,
                }}
                transition={{
                  x: { duration: 1, repeat: Infinity },
                  opacity: { duration: 0.2 },
                }}
                className="w-4 h-4 relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </motion.svg>
            </motion.button>
          );
        })}
      </nav>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-4 mb-4 p-5 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border border-white/20 backdrop-blur-xl relative z-10 overflow-hidden group"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-accent/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Sessions This Month</span>
            </div>
            <motion.span
              key={stats?.sessionsThisMonth}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              {loading ? "..." : stats?.sessionsThisMonth || 0}
            </motion.span>
          </div>

          <div className="h-2 bg-background/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: stats?.sessionsThisMonth
                  ? `${Math.min((stats.sessionsThisMonth / 30) * 100, 100)}%`
                  : "0%",
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full shadow-lg shadow-primary/50"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs text-muted-foreground">Total Insights</span>
            <motion.span
              key={stats?.totalInsights}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-bold text-foreground"
            >
              {loading ? "..." : stats?.totalInsights || 0}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 backdrop-blur-sm relative z-10">
        <UserMenu onNavigate={onViewChange}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/20 backdrop-blur-sm transition-all duration-300 group relative overflow-hidden"
          >
            {/* Glassmorphic hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-accent to-primary shadow-lg relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-lg shadow-green-500/50"
              />
            </div>
            <div className="flex-1 min-w-0 text-left relative z-10">
              <p className="text-sm font-bold text-foreground truncate">
                {user?.displayName || "user"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors relative z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </motion.button>
        </UserMenu>
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
