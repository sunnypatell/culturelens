'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TermsOfServiceModal } from './terms-of-service-modal'

export function Footer() {
  const [showTerms, setShowTerms] = useState(false)

  return (
    <>
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                    <circle cx="12" cy="12" r="4" fill="currentColor"/>
                  </svg>
                </div>
                <span className="font-semibold text-foreground">CultureLens</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Understanding Through Listening. A consent-based conversation mirror with cultural awareness.
              </p>
            </div>

            {/* Hackathon Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Built For</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  <span className="font-medium">HackHive 2026</span>
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  Ontario Tech University
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                  </svg>
                  MLH Sanctioned Event
                </p>
              </div>
            </div>

            {/* Legal Links */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Legal</h3>
              <div className="flex flex-col gap-2 text-sm">
                <Button
                  variant="link"
                  className="justify-start h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowTerms(true)}
                >
                  Terms of Service
                </Button>
                <Button
                  variant="link"
                  className="justify-start h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowTerms(true)}
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="link"
                  className="justify-start h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowTerms(true)}
                >
                  Consent Guidelines
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 CultureLens. Built with care for HackHive 2026.</p>
            <p className="flex items-center gap-1">
              Made with
              <svg className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
              </svg>
              at Ontario Tech University
            </p>
          </div>
        </div>
      </footer>

      <TermsOfServiceModal open={showTerms} onClose={() => setShowTerms(false)} />
    </>
  )
}
