import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  Play,
  User,
  Send,
  Clock,
  Target,
  AlertTriangle,
  Video,
  Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { MatchWithTeams, MatchEvent, MatchLineup, MatchCommentWithUser, Player } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const matchStatusLabels: Record<string, string> = {
  scheduled: "قادمة",
  live: "مباشر",
  completed: "انتهت",
  postponed: "مؤجلة",
};

const eventTypeLabels: Record<string, string> = {
  goal: "هدف",
  own_goal: "هدف عكسي",
  assist: "تمريرة حاسمة",
  yellow_card: "بطاقة صفراء",
  red_card: "بطاقة حمراء",
  substitution_in: "دخول بديل",
  substitution_out: "خروج لاعب",
};

const eventTypeIcons: Record<string, string> = {
  goal: "⚽",
  own_goal: "🔴",
  assist: "👟",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution_in: "🔼",
  substitution_out: "🔽",
};

export default function MatchDetail() {
  const [, params] = useRoute("/matches/:id");
  const matchId = params?.id;
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [comment, setComment] = useState("");

  const { data: match, isLoading } = useQuery<MatchWithTeams>({
    queryKey: ["/api/matches", matchId],
    enabled: !!matchId,
    refetchInterval: (data) => data?.status === "live" ? 10000 : false,
  });

  const { data: events } = useQuery<MatchEvent[]>({
    queryKey: ["/api/matches", matchId, "events"],
    enabled: !!matchId,
  });

  const { data: lineups } = useQuery<MatchLineup[]>({
    queryKey: ["/api/matches", matchId, "lineups"],
    enabled: !!matchId,
  });

  const { data: comments, refetch: refetchComments } = useQuery<MatchCommentWithUser[]>({
    queryKey: ["/api/matches", matchId, "comments"],
    enabled: !!matchId,
  });

  const { data: homePlayers } = useQuery<Player[]>({
    queryKey: ["/api/teams", match?.homeTeamId, "players"],
    enabled: !!match?.homeTeamId,
  });

  const { data: awayPlayers } = useQuery<Player[]>({
    queryKey: ["/api/teams", match?.awayTeamId, "players"],
    enabled: !!match?.awayTeamId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/matches/${matchId}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      refetchComments();
      setComment("");
      toast({ title: "تم إضافة تعليقك" });
    },
    onError: () => {
      toast({ title: "فشل إضافة التعليق", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" dir="rtl">
        <Calendar className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-medium">المباراة غير موجودة</h2>
        <Link href="/leagues">
          <Button>
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للبطولات
          </Button>
        </Link>
      </div>
    );
  }

  const homeEvents = events?.filter(e => e.teamId === match.homeTeamId) || [];
  const awayEvents = events?.filter(e => e.teamId === match.awayTeamId) || [];

  const homeLineup = lineups?.filter(l => l.teamId === match.homeTeamId) || [];
  const awayLineup = lineups?.filter(l => l.teamId === match.awayTeamId) || [];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className={`relative py-12 ${
        match.status === "live" 
          ? "bg-gradient-to-br from-red-600 via-red-500 to-red-700" 
          : "bg-gradient-to-br from-primary via-primary/90 to-primary/80"
      } text-white`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4">
          <Link href={`/leagues/${match.tournamentId}`}>
            <Button variant="ghost" className="text-white/80 hover:text-white mb-4" data-testid="button-back">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للبطولة
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge className={
                match.status === "live" ? "bg-white text-red-600 animate-pulse" :
                match.status === "completed" ? "bg-gray-500" : "bg-blue-500"
              }>
                {match.status === "live" && <Play className="h-3 w-3 ml-1" />}
                {matchStatusLabels[match.status]}
              </Badge>
              <div className="text-sm opacity-80">
                الجولة {match.round} {match.leg === 2 && "- إياب"}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-12">
              <div className="flex-1 text-center">
                <div className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-3">
                  <Users className="h-10 w-10 md:h-14 md:w-14" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">{match.homeTeam?.name}</h2>
              </div>

              <div className="text-center px-4 md:px-8">
                {match.status === "completed" || match.status === "live" ? (
                  <div className="text-5xl md:text-7xl font-bold flex items-center gap-3 md:gap-6">
                    <span>{match.homeScore ?? 0}</span>
                    <span className="text-3xl opacity-50">-</span>
                    <span>{match.awayScore ?? 0}</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold opacity-50">VS</div>
                )}
                {match.matchDate && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm opacity-80">
                    <Clock className="h-4 w-4" />
                    {format(new Date(match.matchDate), "EEEE d MMMM - HH:mm", { locale: ar })}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center">
                <div className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-3">
                  <Users className="h-10 w-10 md:h-14 md:w-14" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">{match.awayTeam?.name}</h2>
              </div>
            </div>

            {match.venue && (
              <div className="text-center mt-6 flex items-center justify-center gap-2 opacity-80">
                <MapPin className="h-4 w-4" />
                {match.venue}
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mt-6">
              {match.streamUrl && (
                <a href={match.streamUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <Video className="h-4 w-4 ml-2" />
                    بث مباشر
                  </Button>
                </a>
              )}
              {match.highlightsUrl && (
                <a href={match.highlightsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <Play className="h-4 w-4 ml-2" />
                    ملخص المباراة
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="events" data-testid="tab-events">الأحداث</TabsTrigger>
            <TabsTrigger value="lineup" data-testid="tab-lineup">التشكيلات</TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments">التعليقات</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  أحداث المباراة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events && events.length > 0 ? (
                  <div className="space-y-3">
                    {events
                      .sort((a, b) => a.minute - b.minute)
                      .map((event) => {
                        const isHome = event.teamId === match.homeTeamId;
                        const players = isHome ? homePlayers : awayPlayers;
                        const player = players?.find(p => p.id === event.playerId);
                        
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: isHome ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-4 p-3 rounded-lg bg-muted/50 ${
                              isHome ? "flex-row" : "flex-row-reverse"
                            }`}
                          >
                            <div className="text-2xl">{eventTypeIcons[event.eventType]}</div>
                            <div className={isHome ? "text-right" : "text-left"}>
                              <div className="font-medium">{player?.name || "لاعب غير محدد"}</div>
                              <div className="text-sm text-muted-foreground">
                                {eventTypeLabels[event.eventType]} - الدقيقة {event.minute}'
                                {event.extraMinute && `+${event.extraMinute}`}
                              </div>
                            </div>
                            <Badge variant="outline" className="mr-auto ml-0">
                              {event.minute}'
                            </Badge>
                          </motion.div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد أحداث مسجلة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lineup">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {match.homeTeam?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {homeLineup.length > 0 ? (
                    <div className="space-y-2">
                      {homeLineup.map((lineup) => {
                        const player = homePlayers?.find(p => p.id === lineup.playerId);
                        return (
                          <div key={lineup.id} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                            <Badge variant="outline">{player?.number}</Badge>
                            <span>{player?.name}</span>
                            {!lineup.isStarter && (
                              <Badge variant="secondary" className="text-xs">بديل</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : homePlayers && homePlayers.length > 0 ? (
                    <div className="space-y-2">
                      {homePlayers.map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                          <Badge variant="outline">{player.number}</Badge>
                          <span>{player.name}</span>
                          <Badge variant="secondary" className="text-xs">{player.position}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">لم يتم تحديد التشكيلة</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {match.awayTeam?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {awayLineup.length > 0 ? (
                    <div className="space-y-2">
                      {awayLineup.map((lineup) => {
                        const player = awayPlayers?.find(p => p.id === lineup.playerId);
                        return (
                          <div key={lineup.id} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                            <Badge variant="outline">{player?.number}</Badge>
                            <span>{player?.name}</span>
                            {!lineup.isStarter && (
                              <Badge variant="secondary" className="text-xs">بديل</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : awayPlayers && awayPlayers.length > 0 ? (
                    <div className="space-y-2">
                      {awayPlayers.map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                          <Badge variant="outline">{player.number}</Badge>
                          <span>{player.name}</span>
                          <Badge variant="secondary" className="text-xs">{player.position}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">لم يتم تحديد التشكيلة</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  تعليقات الجمهور
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAuthenticated && (
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="شاركنا رأيك..."
                        className="min-h-[80px]"
                        data-testid="input-comment"
                      />
                      <Button
                        onClick={() => addCommentMutation.mutate(comment)}
                        disabled={!comment.trim() || addCommentMutation.isPending}
                        data-testid="button-submit-comment"
                      >
                        <Send className="h-4 w-4 ml-2" />
                        إرسال
                      </Button>
                    </div>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="text-center py-4 text-muted-foreground bg-muted/50 rounded-lg">
                    <Link href="/login">
                      <Button variant="link">سجل دخولك</Button>
                    </Link>
                    للمشاركة في التعليقات
                  </div>
                )}

                <div className="space-y-4">
                  {comments?.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <Avatar>
                        <AvatarFallback>{c.user?.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{c.user?.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(c.createdAt), "d MMM - HH:mm", { locale: ar })}
                          </span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {(!comments || comments.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد تعليقات بعد - كن أول المعلقين!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
