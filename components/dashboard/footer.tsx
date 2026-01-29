"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TermsOfServiceModal } from "./terms-of-service-modal";
import { BackendStatus } from "@/components/backend-status";

export function Footer() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span>© 2026 Sunny Patel</span>
              <span className="hidden md:inline text-border">·</span>
              <a
                href="https://www.linkedin.com/in/sunny-patel-30b460204/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/sunnypatell/culturelens"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <Link
                href="/docs"
                className="hover:text-primary transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/docs/api"
                className="hover:text-primary transition-colors"
              >
                API
              </Link>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Button
                variant="link"
                className="h-auto p-0 text-muted-foreground hover:text-foreground text-sm"
                onClick={() => setShowTerms(true)}
              >
                Terms
              </Button>
              <Button
                variant="link"
                className="h-auto p-0 text-muted-foreground hover:text-foreground text-sm"
                onClick={() => setShowTerms(true)}
              >
                Privacy
              </Button>
              <BackendStatus />
            </div>
          </div>
        </div>
      </footer>

      <TermsOfServiceModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
      />
    </>
  );
}
