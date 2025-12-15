import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, MessageSquare } from "lucide-react";
import { Poll } from "@/components/Poll";
import { TournamentComments } from "@/components/TournamentComments";
import { apiRequest } from "@/lib/queryClient";

interface EventHub {
  id: string;
  tournamentId?: string;
  matchId?: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  polls: Array<{
    id: string;
    hubId: string;
    question: string;
    type: string;
    options: string;
    closesAt?: Date;
    createdAt: Date;
  }>;
}

export default function EventHub() {
  const [, params] = useRoute("/event-hubs/:id");
  const hubId = params?.id;

  const { data: hub, isLoading } = useQuery<EventHub>({
    queryKey: ["/api/event-hubs", hubId],
    enabled: !!hubId,
    queryFn: async () => {
      return await apiRequest("GET", `/api/event-hubs/${hubId}`, {});
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">لم يتم العثور على مركز الحدث</p>
            <Link href="/">
              <Button variant="link" className="mt-4">
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Hub Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{hub.title}</CardTitle>
            <Badge variant={hub.isActive ? "default" : "secondary"}>
              {hub.isActive ? "نشط" : "غير نشط"}
            </Badge>
          </div>
          {hub.description && (
            <p className="text-muted-foreground mt-2">{hub.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Polls Section */}
      {hub.polls && hub.polls.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">الاستطلاعات</h2>
          {hub.polls.map((poll) => (
            <Poll key={poll.id} poll={poll} />
          ))}
        </div>
      )}

      {/* Comments Section */}
      {hub.tournamentId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" dir="rtl">
              <MessageSquare className="h-5 w-5" />
              <span>التعليقات</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TournamentComments tournamentId={hub.tournamentId} />
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Link href={hub.tournamentId ? `/leagues/${hub.tournamentId}` : "/"}>
          <Button variant="outline">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة
          </Button>
        </Link>
      </div>
    </div>
  );
}
