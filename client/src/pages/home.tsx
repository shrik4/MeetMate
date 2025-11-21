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

  const audioMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/transcribe-and-analyze", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to transcribe audio");
      }
      return await response.json() as MeetingAnalysis;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "Transcription & Analysis Complete!",
        description: "Your audio has been transcribed and analyzed successfully.",
      });
      
      const section = document.getElementById("results-section");
      section?.scrollIntoView({ behavior: "smooth" });
    },
    onError: (error: Error) => {
      toast({
        title: "Transcription Failed",
        description: error.message || "Failed to transcribe audio. Make sure OPENAI_API_KEY is set.",
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
                  onAnalyzeAudio={(file, meetingType, language, geminiApiKey) => {
                    const formData = new FormData();
                    formData.append("audioFile", file);
                    formData.append("meetingType", meetingType);
                    formData.append("language", language);
                    if (geminiApiKey) {
                      formData.append("apiKey", geminiApiKey);
                    }
                    // Get HF key from localStorage if available
                    const hfKey = typeof window !== "undefined" ? localStorage.getItem("huggingface_api_key") : null;
                    if (hfKey) {
                      formData.append("hfApiKey", hfKey);
                    }
                    audioMutation.mutate(formData);
                  }}
                  isLoading={analyzeMutation.isPending || audioMutation.isPending}
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
