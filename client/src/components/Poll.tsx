import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Poll {
  id: string;
  hubId: string;
  question: string;
  type: string; // single, multiple, prediction
  options: string; // JSON array
  closesAt?: Date;
  createdAt: Date;
}

interface PollResults {
  option: string;
  votes: number;
  percentage: number;
}

interface PollProps {
  poll: Poll;
}

export function Poll({ poll }: PollProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options = JSON.parse(poll.options) as string[];
  const isClosed = poll.closesAt ? new Date(poll.closesAt) < new Date() : false;

  const { data: results, isLoading: resultsLoading } = useQuery<PollResults[]>({
    queryKey: ["/api/polls", poll.id, "results"],
    enabled: !!poll.id,
    refetchInterval: 5000, // Poll every 5 seconds when active
  });

  // Check if user has voted by trying to get their vote (will be handled by backend)
  const { data: voteStatus } = useQuery<{ hasVoted: boolean }>({
    queryKey: ["/api/polls", poll.id, "has-voted"],
    enabled: !!poll.id && isAuthenticated,
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/polls/${poll.id}/has-voted`, {});
        return response;
      } catch {
        return { hasVoted: false };
      }
    },
  });

  const hasVoted = voteStatus?.hasVoted || false;


  const voteMutation = useMutation({
    mutationFn: async (selected: string[]) => {
      return await apiRequest("POST", `/api/polls/${poll.id}/vote`, {
        selectedOptions: JSON.stringify(selected),
      });
    },
    onSuccess: () => {
      toast({ title: "تم التصويت بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/polls", poll.id, "results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/polls", poll.id, "has-voted"] });
    },
    onError: () => {
      toast({ title: "فشل التصويت", variant: "destructive" });
    },
  });

  const handleVote = () => {
    if (selectedOptions.length === 0) {
      toast({ title: "يرجى اختيار خيار واحد على الأقل", variant: "destructive" });
      return;
    }
    if (poll.type === "single" && selectedOptions.length > 1) {
      toast({ title: "يمكنك اختيار خيار واحد فقط", variant: "destructive" });
      return;
    }
    voteMutation.mutate(selectedOptions);
  };

  const handleOptionChange = (option: string, checked: boolean) => {
    if (poll.type === "single") {
      setSelectedOptions(checked ? [option] : []);
    } else {
      setSelectedOptions(prev =>
        checked ? [...prev, option] : prev.filter(o => o !== option)
      );
    }
  };

  const totalVotes = results?.reduce((sum, r) => sum + r.votes, 0) || 0;
  const showResults = hasVoted || isClosed || resultsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{poll.question}</CardTitle>
        {poll.closesAt && !isClosed && (
          <p className="text-sm text-muted-foreground">
            ينتهي في: {new Date(poll.closesAt).toLocaleString("ar-SA")}
          </p>
        )}
        {isClosed && <p className="text-sm text-muted-foreground">تم إغلاق الاستطلاع</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {!showResults ? (
          <>
            {poll.type === "single" ? (
              <RadioGroup
                value={selectedOptions[0] || ""}
                onValueChange={(value) => setSelectedOptions(value ? [value] : [])}
              >
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`option-${index}`}
                      checked={selectedOptions.includes(option)}
                      onCheckedChange={(checked) => handleOptionChange(option, checked as boolean)}
                    />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {isAuthenticated && (
              <Button
                onClick={handleVote}
                disabled={voteMutation.isPending || selectedOptions.length === 0}
                className="w-full"
              >
                {voteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                تصويت
              </Button>
            )}
            {!isAuthenticated && (
              <p className="text-center text-sm text-muted-foreground">
                سجل دخولك للتصويت
              </p>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {resultsLoading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : (
              results?.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{result.option}</span>
                    <span className="text-muted-foreground">
                      {result.votes} صوت ({result.percentage}%)
                    </span>
                  </div>
                  <Progress value={result.percentage} className="h-2" />
                </div>
              ))
            )}
            {totalVotes > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                إجمالي الأصوات: {totalVotes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
