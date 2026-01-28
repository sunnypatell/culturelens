"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import {
  Home,
  Mic,
  Library,
  Lightbulb,
  Settings,
  LogOut,
  Moon,
  Sun,
  FileText,
  Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";

type View = "home" | "record" | "library" | "insights" | "settings";

interface CommandPaletteProps {
  onNavigate: (view: View) => void;
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();

  // listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <>
      {/* trigger button for mobile / discoverability */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-primary-foreground shadow-lg transition-transform hover:scale-105 md:hidden"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* palette */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command palette"
        className="fixed inset-0 z-50"
      >
        {/* backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* dialog */}
        <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border bg-popover text-popover-foreground shadow-2xl">
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full border-b bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* navigation */}
            <Command.Group
              heading="Navigation"
              className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <CommandItem
                icon={<Home className="h-4 w-4" />}
                label="Go to Dashboard"
                shortcut="1"
                onSelect={() => runCommand(() => onNavigate("home"))}
              />
              <CommandItem
                icon={<Mic className="h-4 w-4" />}
                label="New Recording"
                shortcut="2"
                onSelect={() => runCommand(() => onNavigate("record"))}
              />
              <CommandItem
                icon={<Library className="h-4 w-4" />}
                label="Session Library"
                shortcut="3"
                onSelect={() => runCommand(() => onNavigate("library"))}
              />
              <CommandItem
                icon={<Lightbulb className="h-4 w-4" />}
                label="Insights"
                shortcut="4"
                onSelect={() => runCommand(() => onNavigate("insights"))}
              />
              <CommandItem
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
                shortcut="5"
                onSelect={() => runCommand(() => onNavigate("settings"))}
              />
            </Command.Group>

            {/* actions */}
            <Command.Group
              heading="Actions"
              className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <CommandItem
                icon={<FileText className="h-4 w-4" />}
                label="View Results"
                onSelect={() =>
                  runCommand(() => router.push("/results"))
                }
              />
              <CommandItem
                icon={
                  theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )
                }
                label={
                  theme === "dark"
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
                }
                onSelect={() =>
                  runCommand(() =>
                    setTheme(theme === "dark" ? "light" : "dark")
                  )
                }
              />
              <CommandItem
                icon={<LogOut className="h-4 w-4" />}
                label="Sign Out"
                onSelect={() =>
                  runCommand(() => {
                    signOut();
                    router.push("/auth/login");
                  })
                }
              />
            </Command.Group>
          </Command.List>

          {/* footer hint */}
          <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Navigate with arrow keys</span>
            <span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                esc
              </kbd>{" "}
              to close
            </span>
          </div>
        </div>
      </Command.Dialog>
    </>
  );
}

function CommandItem({
  icon,
  label,
  shortcut,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
