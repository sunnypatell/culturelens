"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface TermsOfServiceModalProps {
  open: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({
  open,
  onClose,
}: TermsOfServiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Terms of Service & Privacy Policy
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Introduction */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Introduction
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                CultureLens is a neutral workplace mediation assistant that
                captures conversations and generates action-oriented insights.
                This service is provided for internal conflict resolution and
                team alignment, not legal counsel or HR documentation.
              </p>
            </section>

            <Separator />

            {/* Consent and Recording */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Consent and Recording
              </h3>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    1. Dual Consent Requirement
                  </h4>
                  <p>
                    All participants in a conversation must provide explicit
                    consent before recording begins. CultureLens enforces:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Explicit opt-in for all conversation participants</li>
                    <li>Clear notification when recording is active</li>
                    <li>
                      Ability to revoke consent and delete recordings at any
                      time
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    2. Recording Notice
                  </h4>
                  <p>Users must:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Inform all parties that recording is occurring</li>
                    <li>
                      Obtain verbal or written consent from all participants
                    </li>
                    <li>Comply with local recording laws and regulations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    3. Data Ownership
                  </h4>
                  <p>
                    You retain full ownership of your recordings. We process
                    audio only to generate insights and do not use your data for
                    any other purpose.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Analysis and Insights */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Analysis and Insights
              </h3>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Nature of Insights
                  </h4>
                  <p>CultureLens provides:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Pattern recognition in communication styles</li>
                    <li>Neutrality and bias checks</li>
                    <li>Objective observations without judgment</li>
                    <li>Evidence-based insights and suggested action plans</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Not a Substitute for Professional Help
                  </h4>
                  <p className="font-medium text-foreground">
                    CultureLens is NOT:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>A diagnostic tool for mental health conditions</li>
                    <li>A replacement for therapy or counseling</li>
                    <li>
                      Medical advice or professional psychological assessment
                    </li>
                    <li>
                      A tool for surveillance, monitoring, or control of others
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Cultural Sensitivity */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Neutrality & Bias Protection
              </h3>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Our analysis methodology:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Recognizes diverse communication and conflict styles</li>
                  <li>Avoids stereotyping or making assumptions</li>
                  <li>Provides educational context, not prescriptive advice</li>
                  <li>Respects individual and cultural differences</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Data Privacy */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Data Privacy & Security
              </h3>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    What We Collect
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Audio recordings (with your consent)</li>
                    <li>Transcripts and analysis results</li>
                    <li>User preferences and settings</li>
                    <li>Session metadata (duration, timestamp)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    How We Protect Your Data
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>End-to-end encryption for audio files</li>
                    <li>Secure storage with access controls</li>
                    <li>No sharing with third parties without consent</li>
                    <li>Regular security audits and updates</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Your Rights
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Access your data at any time</li>
                    <li>Delete recordings and insights permanently</li>
                    <li>Export your data in standard formats</li>
                    <li>Opt out of analysis features</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* Prohibited Uses */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Prohibited Uses
              </h3>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground">
                  You may NOT use CultureLens to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Record anyone without their knowledge or consent</li>
                  <li>Monitor, surveil, or control other individuals</li>
                  <li>Violate privacy laws or regulations</li>
                  <li>Collect data for discriminatory purposes</li>
                  <li>
                    Make decisions about employment, credit, or legal matters
                  </li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Limitation of Liability */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Limitation of Liability
              </h3>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>
                  CultureLens is provided "as is" for educational and
                  self-reflection purposes. We make no guarantees about the
                  accuracy, completeness, or reliability of insights generated.
                </p>
                <p>
                  You acknowledge that insights are AI-generated observations
                  and should be considered as one perspective among many in
                  understanding communication patterns.
                </p>
              </div>
            </section>

            <Separator />

            {/* Updates to Terms */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Updates to Terms
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We may update these terms as CultureLens evolves. Users will be
                notified of significant changes and must accept updated terms to
                continue using the service.
              </p>
            </section>

            <Separator />

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Contact & Support
              </h3>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>
                  For questions about these terms, data privacy, or to exercise
                  your rights:
                </p>
                <p className="font-medium text-foreground">
                  HackHive 2026 Team
                  <br />
                  Ontario Tech University
                  <br />
                  contact@culturelens.app
                </p>
              </div>
            </section>

            <Separator />

            <section className="bg-muted/50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Last Updated:
                </span>{" "}
                January 2026
                <br />
                <span className="font-semibold text-foreground">
                  Version:
                </span>{" "}
                1.0 (HackHive 2026 Edition)
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
