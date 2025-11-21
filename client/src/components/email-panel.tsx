import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmailPanelProps {
  analysisId: string;
}

export function EmailPanel({ analysisId }: EmailPanelProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const { toast } = useToast();

  const sendAnalysisMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/send-analysis-email", {
        analysisId,
        recipientEmail: email,
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent!",
        description: "Analysis has been sent successfully.",
      });
      setRecipientEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Email",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const sendDraftMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/send-email-draft", {
        analysisId,
        recipientEmail: email,
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent!",
        description: "Email draft has been sent successfully.",
      });
      setRecipientEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Email",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/send-notification", {
        analysisId,
        recipientEmail: email,
      });
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent!",
        description: "Analysis ready notification has been sent.",
      });
      setRecipientEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Notification",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const isLoading = sendAnalysisMutation.isPending || sendDraftMutation.isPending || sendNotificationMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Options
        </CardTitle>
        <CardDescription>Send analysis and email drafts to team members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient-email">Recipient Email</Label>
          <Input
            id="recipient-email"
            type="email"
            placeholder="colleague@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            data-testid="input-recipient-email"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            variant="outline"
            onClick={() => {
              if (recipientEmail) {
                sendAnalysisMutation.mutate(recipientEmail);
              }
            }}
            disabled={isLoading || !recipientEmail}
            data-testid="button-send-analysis"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Full Analysis
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (recipientEmail) {
                sendDraftMutation.mutate(recipientEmail);
              }
            }}
            disabled={isLoading || !recipientEmail}
            data-testid="button-send-draft"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Email Draft
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (recipientEmail) {
                sendNotificationMutation.mutate(recipientEmail);
              }
            }}
            disabled={isLoading || !recipientEmail}
            data-testid="button-send-notification"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Full Analysis:</strong> Complete meeting summary with all details</p>
          <p>• <strong>Email Draft:</strong> Pre-written follow-up email from your analysis</p>
          <p>• <strong>Notification:</strong> Alert that analysis is ready to review</p>
        </div>
      </CardContent>
    </Card>
  );
}
