import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Users, Mail } from "lucide-react";

export function HeroSection() {
  const scrollToDemo = () => {
    const section = document.getElementById("demo-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full py-12 md:py-20 lg:py-24 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Turn any meeting link into instant tasks, decisions & follow-ups
              </h1>
              <p className="text-lg text-muted-foreground">
                Paste your Google Meet, Zoom, Teams, or YouTube meeting link and let MeetMate AI convert it into summaries, action items, decisions, and a ready-to-send follow-up email.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                AI Meeting Intelligence
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                Built for Hackathons & Startups
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                No manual note-taking
              </Badge>
            </div>

            <div>
              <Button size="lg" onClick={scrollToDemo} data-testid="button-hero-cta">
                Paste a meeting link below
              </Button>
            </div>
          </div>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Meeting Dashboard Preview</span>
                </div>
                
                <div className="space-y-3 rounded-lg bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Summary Generated</p>
                      <p className="text-xs text-muted-foreground">Key points extracted automatically</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Action Items Detected</p>
                      <p className="text-xs text-muted-foreground">Tasks assigned with priorities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Follow-up Email Ready</p>
                      <p className="text-xs text-muted-foreground">Professional draft created</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Real-time AI analysis powered by Gemini
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
