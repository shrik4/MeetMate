import { Card, CardContent } from "@/components/ui/card";
import { Link2, Brain, Mail } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Link2,
      title: "Paste meeting link",
      description: "Provide your Google Meet, Zoom, Teams, or YouTube recording link.",
    },
    {
      icon: Brain,
      title: "AI analyzes the conversation",
      description: "Transcription + summarization + decision & task extraction + sentiment.",
    },
    {
      icon: Mail,
      title: "Get instant report & email",
      description: "Share with your team in one click. No manual note-taking.",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-12 md:py-20 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to transform your meetings
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
