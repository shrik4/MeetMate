import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { MeetingInput } from "@/components/meeting-input";
import { ResultsDashboard } from "@/components/results-dashboard";
import { HowItWorks } from "@/components/how-it-works";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MeetingAnalysis } from "@shared/schema";

export default function Home() {
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (data: {
      meetingLink: string;
      meetingType: string;
      language: string;
      isDemo: boolean;
      apiKey?: string;
    }) => {
      return await apiRequest("POST", "/api/analyze-meeting", data) as unknown as MeetingAnalysis;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Analysis Complete!",
        description: "Your meeting has been analyzed successfully.",
      });
      
      const section = document.getElementById("results-section");
      section?.scrollIntoView({ behavior: "smooth" });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        
        <section id="demo-section" className="w-full py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <MeetingInput
                  onAnalyze={(data) => analyzeMutation.mutate(data)}
                  isLoading={analyzeMutation.isPending}
                />
              </div>
              
              <div id="results-section">
                <ResultsDashboard analysis={analysis} />
              </div>
            </div>
          </div>
        </section>
        
        <HowItWorks />
      </main>
      
      <Footer />
    </div>
  );
}
