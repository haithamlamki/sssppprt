import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin,
  ArrowRight,
  Target,
  Award,
  ChevronLeft,
  Plus,
  Clock,
  Play,
  CheckCircle2,
  User,
  Shield,
  BarChart3,
  MessageCircle,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { TeamBox, getTeamColor, isLightColor } from "@/components/TeamBox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import type { Tournament, Team, MatchWithTeams, PlayerWithTeam } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { TournamentComments } from "@/components/TournamentComments";
import { TeamChat } from "@/components/TeamChat";
import { TeamNameDisplay } from "@/utils/teamNameUtils";
import { KnockoutBracket } from "@/components/KnockoutBracket";

const sportLabels: Record<string, string> = {
  football: "كرة القدم",
  basketball: "كرة السلة",
  volleyball: "الكرة الطائرة",
  tennis: "التنس",
};

const typeLabels: Record<string, string> = {
  round_robin: "دوري كامل (ذهاب وإياب)",
  knockout: "خروج مغلوب",
  groups: "مجموعات",
  groups_knockout: "مجموعات + خروج مغلوب",
};

const statusLabels: Record<string, string> = {
  registration: "التسجيل مفتوح",
  ongoing: "جارية",
  completed: "منتهية",
};

const matchStatusLabels: Record<string, string> = {
  scheduled: "قادمة",
  live: "مباشر",
  completed: "انتهت",
  postponed: "مؤجلة",
};

const matchStatusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500",
  live: "bg-red-500 text-white animate-pulse",
  completed: "bg-gray-500/10 text-gray-500",
  postponed: "bg-yellow-500/10 text-yellow-500",
};

const groupLabels: Record<number, string> = {
  1: "المجموعة أ",
  2: "المجموعة ب",
  3: "المجموعة ج",
  4: "المجموعة د",
  5: "المجموعة هـ",
  6: "المجموعة و",
  7: "المجموعة ز",
  8: "المجموعة ح",
};

const stageLabels: Record<string, string> = {
  group: "مرحلة المجموعات",
  league: "الدوري",
  round_of_16: "دور الـ 16",
  quarter_final: "ربع النهائي",
  semi_final: "نصف النهائي",
  final: "النهائي",
  third_place: "المركز الثالث",
};

function getMatchLabel(match: MatchWithTeams): string {
  const stage = match.stage;
  
  // For knockout stages, show stage name instead of round
  if (stage === "final" || stage === "third_place") {
    return stageLabels[stage];
  }
  
  if (stage === "semi_final" || stage === "quarter_final" || stage === "round_of_16") {
    const stageLabel = stageLabels[stage];
    if (match.round && match.round > 1) {
      return `${stageLabel} ${match.round}`;
    }
    return stageLabel;
  }
  
  // For group/league matches, show round
  if (match.round) {
    return `الجولة ${match.round}${match.leg === 2 ? " - إياب" : ""}`;
  }
  
  return "";
}

function getKnockoutTeamLabel(match: MatchWithTeams, isHome: boolean): string {
  // For knockout matches without teams assigned yet
  if (match.stage === "final") {
    return isHome ? "فائز نصف النهائي 1" : "فائز نصف النهائي 2";
  }
  if (match.stage === "third_place") {
    return isHome ? "خاسر نصف النهائي 1" : "خاسر نصف النهائي 2";
  }
  if (match.stage === "semi_final") {
    const groupLetters: Record<number, string> = { 1: "أ", 2: "ب", 3: "ج", 4: "د" };
    const matchNum = match.round || 1;
    if (matchNum === 1) {
      return isHome ? "أول المجموعة أ" : "ثاني المجموعة ب";
    } else {
      return isHome ? "أول المجموعة ب" : "ثاني المجموعة أ";
    }
  }
  return "يحدد لاحقاً";
}

interface GroupStandingsData {
  groupNumber: number;
  teams: Team[];
}

function GroupStandings({ standings, matches, isLoading }: { standings: GroupStandingsData[]; matches?: MatchWithTeams[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>جاري تحميل ترتيب المجموعات...</p>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>لم يتم تقسيم الفرق إلى مجموعات بعد</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {standings.map(({ groupNumber, teams: groupTeams }) => {
        if (!groupTeams || groupTeams.length === 0) {
          return null;
        }
        
        const groupMatches = matches?.filter(m => 
          m.stage === "group" && 
          groupTeams.some(t => t.id === m.homeTeamId || t.id === m.awayTeamId)
        ) || [];
        
        return (
          <Card key={groupNumber} data-testid={`group-${groupNumber}`}>
            <CardHeader className="p-3 pb-1.5 sm:pb-2" dir="ltr">
              <CardTitle className="font-semibold tracking-tight flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-[10px] sm:text-xs">{groupNumber}</span>
                </div>
                <span className="truncate">{groupLabels[groupNumber] || `المجموعة ${groupNumber}`}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="overflow-x-visible">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[10px] sm:text-xs bg-muted/50">
                      <TableHead className="text-center w-6 px-0.5">#</TableHead>
                      <TableHead className="text-left px-1 min-w-0" dir="ltr">الفريق</TableHead>
                      <TableHead className="text-center px-0.5 w-6">لعب</TableHead>
                      <TableHead className="text-center px-0.5 w-6">ف</TableHead>
                      <TableHead className="text-center px-0.5 w-6">ت</TableHead>
                      <TableHead className="text-center px-0.5 w-6">خ</TableHead>
                      <TableHead className="text-center px-0.5 w-6">له</TableHead>
                      <TableHead className="text-center px-0.5 w-6">عليه</TableHead>
                      <TableHead className="text-center px-0.5 w-8">فارق</TableHead>
                      <TableHead className="text-center px-1 w-8 font-bold bg-primary/5">نقاط</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupTeams.map((team, index) => {
                      const isQualified = index < 2;
                      return (
                        <TableRow 
                          key={team.id} 
                          className={isQualified ? "bg-emerald-500/5" : ""}
                          data-testid={`row-group-team-${team.id}`}
                        >
                          <TableCell className="font-bold px-0.5 text-[10px] sm:text-xs text-center">
                            {index === 0 && <Trophy className="h-3 w-3 text-yellow-500 mx-auto" />}
                            {index > 0 && index + 1}
                          </TableCell>
                          <TableCell className="font-medium px-1 text-[10px] sm:text-xs text-left min-w-0" dir="ltr">
                            <div className="flex items-center gap-1 justify-start min-w-0">
                              {team.logoUrl ? (
                                <img 
                                  src={team.logoUrl} 
                                  alt={team.name} 
                                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Users className="h-2.5 w-2.5 text-primary" />
                                </div>
                              )}
                              <span className="truncate min-w-0">{team.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center px-0.5 text-[10px] sm:text-xs">{team.played}</TableCell>
                          <TableCell className="text-center px-0.5 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">{team.won}</TableCell>
                          <TableCell className="text-center px-0.5 text-[10px] sm:text-xs text-muted-foreground">{team.drawn}</TableCell>
                          <TableCell className="text-center px-0.5 text-[10px] sm:text-xs text-red-600 dark:text-red-400">{team.lost}</TableCell>
                          <TableCell className="text-center px-0.5 text-[10px] sm:text-xs">{team.goalsFor}</TableCell>
                          <TableCell className="text-center px-0.5 text-[10px] sm:text-xs">{team.goalsAgainst}</TableCell>
                          <TableCell className="text-center px-0.5 text-[10px] sm:text-xs">
                            <span className={team.goalDifference > 0 ? "text-emerald-600 dark:text-emerald-400" : team.goalDifference < 0 ? "text-red-600 dark:text-red-400" : ""}>
                              {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                            </span>
                          </TableCell>
                          <TableCell className="text-center px-1 font-bold text-[10px] sm:text-xs bg-primary/5">{team.points}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground text-right">
                <div className="flex items-center gap-0.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded bg-emerald-500/20 flex-shrink-0" />
                  <span className="truncate">يتأهل للأدوار الإقصائية</span>
                </div>
              </div>

              {groupMatches.length > 0 && (
                <div className="mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t">
                  <h4 className="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium mb-1.5 sm:mb-2 md:mb-3 flex items-center justify-center gap-1 sm:gap-2">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="truncate">مباريات المجموعة</span>
                  </h4>
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    {groupMatches.map((match) => (
                      <GroupMatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function GroupMatchCard({ match }: { match: MatchWithTeams }) {
  const isCompleted = match.status === "completed";
  const homeWon = isCompleted && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isCompleted && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <Link href={`/matches/${match.id}`}>
      <motion.div 
        whileHover={{ x: -2 }}
        className="flex items-center justify-between p-1.5 sm:p-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer hover-elevate overflow-hidden"
        data-testid={`group-match-${match.id}`}
      >
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 justify-center">
          <TeamNameDisplay 
            name={match.homeTeam?.name || getKnockoutTeamLabel(match, true)}
            className={`font-medium text-center ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}
          />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 md:px-3 flex-shrink-0">
          {isCompleted ? (
            <>
              <span className={`font-bold min-w-[16px] sm:min-w-[20px] text-center text-[10px] sm:text-xs md:text-sm ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                {match.homeScore}
              </span>
              <span className="text-muted-foreground text-[10px] sm:text-xs">-</span>
              <span className={`font-bold min-w-[16px] sm:min-w-[20px] text-center text-[10px] sm:text-xs md:text-sm ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                {match.awayScore}
              </span>
            </>
          ) : (
            <Badge variant="outline" className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm px-1 sm:px-1.5 md:px-2">
              {matchStatusLabels[match.status]}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center min-w-0">
          <TeamNameDisplay 
            name={match.awayTeam?.name || getKnockoutTeamLabel(match, false)}
            className={`font-medium text-center ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}
          />
        </div>
      </motion.div>
    </Link>
  );
}

export default function LeagueDetail() {
  const [, params] = useRoute("/leagues/:id");
  const tournamentId = params?.id;
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "committee_member";
  const queryClient = useQueryClient();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [teamName, setTeamName] = useState("");

  const { data: tournament, isLoading: tournamentLoading } = useQuery<Tournament>({
    queryKey: ["/api/tournaments", tournamentId],
    enabled: !!tournamentId,
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/tournaments", tournamentId, "teams"],
    enabled: !!tournamentId,
  });

  const { data: matches } = useQuery<MatchWithTeams[]>({
    queryKey: ["/api/tournaments", tournamentId, "matches"],
    enabled: !!tournamentId,
  });

  const { data: topScorers, refetch: refetchTopScorers } = useQuery<PlayerWithTeam[]>({
    queryKey: ["/api/tournaments", tournamentId, "top-scorers"],
    enabled: !!tournamentId,
    refetchInterval: false,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache at all
  });

  const recalculateStatsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/recalculate-stats`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to recalculate stats");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "تم إعادة حساب الإحصائيات بنجاح",
        description: data.message 
      });
      // Force refetch with cache bypass
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "top-scorers"] });
      setTimeout(() => {
        refetchTopScorers();
      }, 500);
    },
    onError: (error: any) => {
      console.error("Recalculate stats error:", error);
      toast({ 
        title: "فشل إعادة حساب الإحصائيات", 
        description: error.message || "تأكد من أن السيرفر يعمل وأنك مسجل كمدير",
        variant: "destructive" 
      });
    },
  });

  const { data: groupStandings = [], isLoading: standingsLoading } = useQuery<GroupStandingsData[]>({
    queryKey: ["/api/tournaments", tournamentId, "group-standings"],
    enabled: !!tournamentId && tournament?.hasGroupStage === true,
  });

  const registerTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", `/api/tournaments/${tournamentId}/teams`, { name });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "teams"] });
      setIsRegisterOpen(false);
      setTeamName("");
      toast({
        title: "تم التسجيل بنجاح!",
        description: "تم تسجيل فريقك في البطولة",
      });
    },
    onError: () => {
      toast({
        title: "فشل التسجيل",
        description: "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
    },
  });

  if (tournamentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" dir="rtl">
        <Trophy className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-medium">البطولة غير موجودة</h2>
        <Link href="/leagues">
          <Button>
            <ArrowRight className="mr-2 h-4 w-4" />
            العودة للبطولات
          </Button>
        </Link>
      </div>
    );
  }

  const sortedTeams = [...(teams || [])].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const upcomingMatches = matches?.filter(m => m.status === "scheduled" || m.status === "live") || [];
  const completedMatches = matches?.filter(m => m.status === "completed") || [];

  const themeConfig = (() => {
    if (!tournament.themeConfig) return { primaryColor: null, secondaryColor: null };
    try {
      const parsed = JSON.parse(tournament.themeConfig);
      return {
        primaryColor: parsed.primaryColor || null,
        secondaryColor: parsed.secondaryColor || null,
      };
    } catch {
      return { primaryColor: null, secondaryColor: null };
    }
  })();
  
  const heroImage = tournament.heroImageUrl || tournament.imageUrl;
  const hasCustomTheme = themeConfig.primaryColor && themeConfig.secondaryColor;
  
  const heroStyle = hasCustomTheme 
    ? { background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor})` }
    : {};

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div 
        className={`relative text-white py-8 ${!hasCustomTheme ? 'bg-gradient-to-br from-primary via-primary/90 to-primary/80' : ''}`}
        style={heroStyle}
      >
        {heroImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4">
          <Link href="/leagues">
            <Button variant="ghost" className="text-white/80 hover:text-white mb-4" data-testid="button-back">
              <ArrowRight className="mr-2 h-4 w-4" />
              العودة للبطولات
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-10 w-10" />
                <Badge className={
                  tournament.status === "registration" ? "bg-emerald-500" :
                  tournament.status === "ongoing" ? "bg-orange-500" : "bg-gray-500"
                }>
                  {statusLabels[tournament.status]}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{tournament.name}</h1>
              <p className="text-xs sm:text-sm md:text-base opacity-90 max-w-2xl">{tournament.description}</p>
            </div>

            {tournament.status === "registration" && isAuthenticated && (
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-register-team">
                    <Plus className="mr-2 h-5 w-5" />
                    سجّل فريقك
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle>تسجيل فريق جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamName">اسم الفريق</Label>
                      <Input
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="أدخل اسم الفريق"
                        data-testid="input-team-name"
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => registerTeamMutation.mutate(teamName)}
                      disabled={!teamName.trim() || registerTeamMutation.isPending}
                      data-testid="button-submit-team"
                    >
                      {registerTeamMutation.isPending ? "جاري التسجيل..." : "تسجيل الفريق"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mt-3 sm:mt-4 md:mt-6 lg:mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-1.5 sm:p-2 md:p-3 lg:p-4 text-center">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mx-auto mb-0.5 sm:mb-1 md:mb-2" />
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold truncate">{sportLabels[tournament.sport]}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm opacity-80 truncate">الرياضة</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-1.5 sm:p-2 md:p-3 lg:p-4 text-center">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mx-auto mb-0.5 sm:mb-1 md:mb-2" />
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold truncate">{typeLabels[tournament.type]?.split(" ")[0]}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm opacity-80 truncate">نوع البطولة</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-1.5 sm:p-2 md:p-3 lg:p-4 text-center">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mx-auto mb-0.5 sm:mb-1 md:mb-2" />
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold truncate">{teams?.length || 0} / {tournament.maxTeams}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm opacity-80 truncate">الفرق المسجلة</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-1.5 sm:p-2 md:p-3 lg:p-4 text-center">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mx-auto mb-0.5 sm:mb-1 md:mb-2" />
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold truncate">{matches?.length || 0}</div>
              <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm opacity-80 truncate">المباريات</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <Tabs defaultValue="standings" className="space-y-3 sm:space-y-4 md:space-y-6">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 grid-rows-2 sm:grid-cols-6 sm:grid-rows-1 gap-3 sm:gap-1">
            <TabsTrigger value="standings" data-testid="tab-standings" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-1.5 relative z-0">الترتيب</TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-1.5 relative z-0">المباريات</TabsTrigger>
            <TabsTrigger value="scorers" data-testid="tab-scorers" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-1.5 relative z-0">الهدافين</TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-1.5 relative z-0">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="truncate">إحصائيات</span>
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-1.5 relative z-0">الفرق</TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-1.5 relative z-0">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="truncate">التعليقات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standings">
            {tournament.hasGroupStage ? (
              <GroupStandings standings={groupStandings} matches={matches} isLoading={standingsLoading} />
            ) : (
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg" dir="rtl">
                    <span>جدول الترتيب</span>
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-gold flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedTeams.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right w-12 text-xs sm:text-sm">#</TableHead>
                            <TableHead className="text-right text-xs sm:text-sm">الفريق</TableHead>
                            <TableHead className="text-center text-xs sm:text-sm">لعب</TableHead>
                            <TableHead className="text-center text-xs sm:text-sm">فاز</TableHead>
                            <TableHead className="text-center text-xs sm:text-sm">تعادل</TableHead>
                            <TableHead className="text-center text-xs sm:text-sm">خسر</TableHead>
                            <TableHead className="text-center text-xs sm:text-sm">له</TableHead>
                            <TableHead className="text-center text-xs sm:text-sm">عليه</TableHead>
                            <TableHead className="text-center text-xs sm:text-sm">الفارق</TableHead>
                            <TableHead className="text-center font-bold text-xs sm:text-sm">النقاط</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedTeams.map((team, index) => (
                            <TableRow 
                              key={team.id} 
                              className={index < 3 ? "bg-primary/5" : ""}
                              data-testid={`row-team-${team.id}`}
                            >
                              <TableCell className="font-bold text-xs sm:text-sm">
                                {index === 0 && <span className="text-gold">🥇</span>}
                                {index === 1 && <span className="text-gray-400">🥈</span>}
                                {index === 2 && <span className="text-amber-600">🥉</span>}
                                {index > 2 && index + 1}
                              </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm text-right">
                            <div className="flex items-center gap-1 sm:gap-2 justify-end">
                              <span className="truncate">{team.name}</span>
                              {team.logoUrl ? (
                                <img 
                                  src={team.logoUrl} 
                                  alt={team.name} 
                                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs sm:text-sm">{team.played}</TableCell>
                              <TableCell className="text-center text-xs sm:text-sm text-emerald-500">{team.won}</TableCell>
                              <TableCell className="text-center text-xs sm:text-sm text-gray-500">{team.drawn}</TableCell>
                              <TableCell className="text-center text-xs sm:text-sm text-red-500">{team.lost}</TableCell>
                              <TableCell className="text-center text-xs sm:text-sm">{team.goalsFor}</TableCell>
                              <TableCell className="text-center text-xs sm:text-sm">{team.goalsAgainst}</TableCell>
                              <TableCell className="text-center text-xs sm:text-sm">
                                <span className={team.goalDifference > 0 ? "text-emerald-500" : team.goalDifference < 0 ? "text-red-500" : ""}>
                                  {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                                </span>
                              </TableCell>
                              <TableCell className="text-center font-bold text-xs sm:text-sm md:text-base">{team.points}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لم يتم تسجيل أي فرق بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-6" dir="ltr">
            <MatchesView matches={matches || []} tournament={tournament} />
            
            {/* Knockout Stage Section */}
            {tournament.type === "groups_knockout" && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" dir="rtl">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span>مرحلة خروج المغلوب</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <KnockoutBracket 
                    matches={matches || []} 
                    tournament={tournament}
                    groupStageComplete={matches?.some(m => m.stage === "group" && m.status === "completed") || false}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scorers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2" dir="rtl">
                    <span>قائمة الهدافين</span>
                    <Target className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  </CardTitle>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => recalculateStatsMutation.mutate()}
                      disabled={recalculateStatsMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${recalculateStatsMutation.isPending ? "animate-spin" : ""}`} />
                      إعادة حساب الإحصائيات
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {topScorers && topScorers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right w-12">#</TableHead>
                          <TableHead className="text-right">اللاعب</TableHead>
                          <TableHead className="text-right">الفريق</TableHead>
                          <TableHead className="text-center">الأهداف</TableHead>
                          <TableHead className="text-center">التمريرات</TableHead>
                          <TableHead className="text-center">المباريات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topScorers.map((player, index) => (
                          <TableRow key={player.id} data-testid={`row-scorer-${player.id}`}>
                            <TableCell className="font-bold">
                              {index === 0 && "🥇"}
                              {index === 1 && "🥈"}
                              {index === 2 && "🥉"}
                              {index > 2 && index + 1}
                            </TableCell>
                            <TableCell className="font-medium text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <Badge variant="outline" className="text-sm flex-shrink-0">
                                  #{player.number}
                                </Badge>
                                <span className="truncate">{player.name}</span>
                                <User className="h-4 w-4 flex-shrink-0" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <span className="truncate">{player.team?.name || "غير محدد"}</span>
                                {player.team?.logoUrl ? (
                                  <img 
                                    src={player.team.logoUrl} 
                                    alt={player.team.name || "فريق"} 
                                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-3 w-3 text-primary" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold text-xs sm:text-sm md:text-base">{player.goals}</TableCell>
                            <TableCell className="text-center">{player.assists}</TableCell>
                            <TableCell className="text-center">{player.matchesPlayed}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا يوجد هدافون حتى الآن</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm" dir="ltr">
                    <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>أفضل دفاع</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {teams && teams.length > 0 ? (
                    <div className="space-y-2">
                      {[...teams]
                        .filter(t => t.played > 0)
                        .sort((a, b) => {
                          const aAvg = a.goalsAgainst / (a.played || 1);
                          const bAvg = b.goalsAgainst / (b.played || 1);
                          return aAvg - bAvg;
                        })
                        .slice(0, 5)
                        .map((team, index) => (
                          <div 
                            key={team.id} 
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                            data-testid={`row-defense-${team.id}`}
                            dir="ltr"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                                index === 1 ? "bg-gray-400/20 text-gray-600" :
                                index === 2 ? "bg-amber-600/20 text-amber-700" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {index + 1}
                              </div>
                              <span className="text-xs font-medium break-words hyphens-auto min-w-0">{team.name}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="text-center">
                                <div className="text-xs font-bold text-blue-500">{team.goalsAgainst}</div>
                                <div className="text-[10px] text-muted-foreground">أهداف ضده</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-bold">{(team.goalsAgainst / (team.played || 1)).toFixed(2)}</div>
                                <div className="text-[10px] text-muted-foreground">معدل/مباراة</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {teams.filter(t => t.played > 0).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Shield className="h-6 w-6 mx-auto mb-1 opacity-50" />
                          <p className="text-xs">لا توجد مباريات منتهية بعد</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Shield className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">لا توجد فرق مسجلة بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm" dir="ltr">
                    <Target className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>أفضل هجوم</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {teams && teams.length > 0 ? (
                    <div className="space-y-2">
                      {[...teams]
                        .filter(t => t.played > 0)
                        .sort((a, b) => b.goalsFor - a.goalsFor)
                        .slice(0, 5)
                        .map((team, index) => (
                          <div 
                            key={team.id} 
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                            data-testid={`row-attack-${team.id}`}
                            dir="ltr"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                                index === 1 ? "bg-gray-400/20 text-gray-600" :
                                index === 2 ? "bg-amber-600/20 text-amber-700" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {index + 1}
                              </div>
                              <span className="text-xs font-medium break-words hyphens-auto min-w-0">{team.name}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="text-center">
                                <div className="text-xs font-bold text-emerald-500">{team.goalsFor}</div>
                                <div className="text-[10px] text-muted-foreground">أهداف له</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-bold">{(team.goalsFor / (team.played || 1)).toFixed(2)}</div>
                                <div className="text-[10px] text-muted-foreground">معدل/مباراة</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {teams.filter(t => t.played > 0).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Target className="h-6 w-6 mx-auto mb-1 opacity-50" />
                          <p className="text-xs">لا توجد مباريات منتهية بعد</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Target className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">لا توجد فرق مسجلة بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" dir="rtl">
                  <span>سجل البطاقات</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-4 h-5 bg-yellow-500 rounded-sm" />
                    <div className="w-4 h-5 bg-red-500 rounded-sm" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topScorers && topScorers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">#</TableHead>
                          <TableHead className="text-right">اللاعب</TableHead>
                          <TableHead className="text-right">الفريق</TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-3 h-4 bg-yellow-500 rounded-sm" />
                              صفراء
                            </div>
                          </TableHead>
                          <TableHead className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-3 h-4 bg-red-500 rounded-sm" />
                              حمراء
                            </div>
                          </TableHead>
                          <TableHead className="text-center">المجموع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...topScorers]
                          .filter(p => (p.yellowCards || 0) + (p.redCards || 0) > 0)
                          .sort((a, b) => {
                            const aTotal = (a.redCards || 0) * 2 + (a.yellowCards || 0);
                            const bTotal = (b.redCards || 0) * 2 + (b.yellowCards || 0);
                            return bTotal - aTotal;
                          })
                          .slice(0, 10)
                          .map((player, index) => (
                            <TableRow key={player.id} data-testid={`row-cards-${player.id}`}>
                              <TableCell className="font-bold">{index + 1}</TableCell>
                              <TableCell className="font-medium text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <Badge variant="outline" className="text-sm flex-shrink-0">#{player.number}</Badge>
                                  <span className="truncate">{player.name}</span>
                                  <User className="h-4 w-4 flex-shrink-0" />
                                </div>
                              </TableCell>
                              <TableCell>{player.team?.name}</TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-yellow-500/20 text-yellow-600 border-0">
                                  {player.yellowCards || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-red-500/20 text-red-600 border-0">
                                  {player.redCards || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-bold">
                                {(player.yellowCards || 0) + (player.redCards || 0)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    {topScorers.filter(p => (p.yellowCards || 0) + (p.redCards || 0) > 0).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="flex justify-center gap-2 mb-2">
                          <div className="w-6 h-8 bg-yellow-500/30 rounded opacity-50" />
                          <div className="w-6 h-8 bg-red-500/30 rounded opacity-50" />
                        </div>
                        <p>لا توجد بطاقات مسجلة بعد</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="flex justify-center gap-2 mb-2">
                      <div className="w-6 h-8 bg-yellow-500/30 rounded opacity-50" />
                      <div className="w-6 h-8 bg-red-500/30 rounded opacity-50" />
                    </div>
                    <p>لا يوجد لاعبون مسجلون بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-base font-bold text-primary">{matches?.filter(m => m.status === "completed").length || 0}</div>
                  <div className="text-base text-muted-foreground mt-1">مباريات منتهية</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-base font-bold text-emerald-500">
                    {matches?.filter(m => m.status === "completed").reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0) || 0}
                  </div>
                  <div className="text-base text-muted-foreground mt-1">إجمالي الأهداف</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-base font-bold text-yellow-500">
                    {topScorers?.reduce((sum, p) => sum + (p.yellowCards || 0), 0) || 0}
                  </div>
                  <div className="text-base text-muted-foreground mt-1">بطاقات صفراء</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-base font-bold text-red-500">
                    {topScorers?.reduce((sum, p) => sum + (p.redCards || 0), 0) || 0}
                  </div>
                  <div className="text-base text-muted-foreground mt-1">بطاقات حمراء</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams?.map((team) => (
                <Card key={team.id} className="hover-elevate" data-testid={`card-team-${team.id}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 justify-start" dir="ltr">
                      {team.logoUrl ? (
                        <img 
                          src={team.logoUrl} 
                          alt={team.name} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="text-left min-w-0 flex-1">
                        <h3 className="font-bold text-xs break-words hyphens-auto">{team.name}</h3>
                        <p className="text-[10px] text-muted-foreground">
                          {team.points} نقطة
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-emerald-500/10 rounded p-1.5">
                        <div className="text-xs font-bold text-emerald-500">{team.won}</div>
                        <div className="text-[10px] text-muted-foreground">فوز</div>
                      </div>
                      <div className="bg-gray-500/10 rounded p-1.5">
                        <div className="text-xs font-bold text-gray-500">{team.drawn}</div>
                        <div className="text-[10px] text-muted-foreground">تعادل</div>
                      </div>
                      <div className="bg-red-500/10 rounded p-1.5">
                        <div className="text-xs font-bold text-red-500">{team.lost}</div>
                        <div className="text-[10px] text-muted-foreground">خسارة</div>
                      </div>
                    </div>
                    {isAuthenticated && (
                      <div className="mt-2">
                        <TeamChatDialog teamId={team.id} teamName={team.name} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!teams || teams.length === 0) && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لم يتم تسجيل أي فرق بعد</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" dir="rtl">
                  <MessageSquare className="h-5 w-5" />
                  <span>تعليقات البطولة</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tournamentId && <TournamentComments tournamentId={tournamentId} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Team Chat Dialog Component
function TeamChatDialog({ teamId, teamName }: { teamId: string; teamName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-xs h-7">
          <MessageCircle className="h-3 w-3 ml-1" />
          محادثة الفريق
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle>محادثة {teamName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <TeamChat teamId={teamId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Format time range for match (e.g., "4:10 PM–4:45 PM")
// Default duration: 2 halves of 20 min + 5 min break = 45 min (typical for company tournaments)
// Uses Asia/Muscat timezone to display correct Muscat wall-clock time
function formatMatchTimeRange(matchDate: Date, durationMinutes: number = 45): string {
  // Ensure valid duration
  const duration = typeof durationMinutes === 'number' && !isNaN(durationMinutes) && durationMinutes > 0 
    ? durationMinutes 
    : 45;
  
  const endDate = new Date(matchDate.getTime() + duration * 60 * 1000);
  
  // Use Intl.DateTimeFormat with Asia/Muscat timezone and 12-hour format in English
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Muscat',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Get formatted strings and extract just the time and period
  const startFormatted = timeFormatter.format(matchDate);
  const endFormatted = timeFormatter.format(endDate);
  
  // Use LRM (\u200E) to fix RTL issues, en-dash (–)
  return `\u200E${startFormatted}–${endFormatted}`;
}

// Schedule Match Cell - for grid layout with multiple venues
function ScheduleMatchCell({ match, tournament }: { match: MatchWithTeams; tournament?: Tournament }) {
  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const homeWon = isCompleted && homeScore > awayScore;
  const awayWon = isCompleted && awayScore > homeScore;
  
  const matchDate = match.matchDate ? new Date(match.matchDate) : null;
  const timeRange = matchDate ? formatMatchTimeRange(matchDate, 35) : "";
  
  return (
    <Link href={`/matches/${match.id}`}>
      <div
        className={`bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-lg p-2 sm:p-4 cursor-pointer hover:shadow-md transition-all min-h-[100px] sm:min-h-[140px] flex flex-col pb-0 ${isLive ? "ring-2 ring-red-500" : ""}`}
        data-testid={`schedule-cell-${match.id}`}
      >
        {/* Main Content - Large Logos with Team Names and Score */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 flex-1">
          {/* Home Team Section */}
          <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1">
            {/* Large Home Team Logo */}
            <div className="flex items-center justify-center">
              {match.homeTeam?.logoUrl ? (
                <img 
                  src={match.homeTeam.logoUrl} 
                  alt={match.homeTeam.name || "شعار الفريق"}
                  className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 text-gray-400" />
                </div>
              )}
            </div>
            {/* Home Team Name */}
            <TeamNameDisplay 
              name={match.homeTeam?.name || "فريق غير محدد"}
              className="text-gray-900 font-bold text-center leading-tight text-[9px] sm:text-xs md:text-sm max-w-full"
            />
          </div>
          
          {/* Center Section - Tournament Logo or VS/Score */}
          <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* Tournament Logo (if available) */}
            {tournament?.imageUrl && (
              <div className="mb-0.5 sm:mb-1">
                <img 
                  src={tournament.imageUrl} 
                  alt={tournament.name || "شعار البطولة"}
                  className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
                />
              </div>
            )}
            {/* Live Badge */}
            {isLive && (
              <Badge className="bg-red-500 text-white animate-pulse text-[8px] sm:text-[10px] md:text-xs mb-0.5 sm:mb-1">مباشر</Badge>
            )}
            {/* Score or VS */}
            {isCompleted || isLive ? (
              <div className="bg-white text-gray-900 border-2 border-gray-300 rounded-lg px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 min-w-[45px] sm:min-w-[60px] md:min-w-[70px] text-center shadow-sm">
                <div className="text-xs sm:text-base md:text-lg font-bold">
                  {homeScore} - {awayScore}
                </div>
              </div>
            ) : (
              <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-400">VS</div>
            )}
          </div>
          
          {/* Away Team Section */}
          <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1">
            {/* Large Away Team Logo */}
            <div className="flex items-center justify-center">
              {match.awayTeam?.logoUrl ? (
                <img 
                  src={match.awayTeam.logoUrl} 
                  alt={match.awayTeam.name || "شعار الفريق"}
                  className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 text-gray-400" />
                </div>
              )}
            </div>
            {/* Away Team Name */}
            <TeamNameDisplay 
              name={match.awayTeam?.name || "فريق غير محدد"}
              className="text-gray-900 font-bold text-center leading-tight text-[9px] sm:text-xs md:text-sm max-w-full"
            />
          </div>
        </div>
        
        {/* Bottom Section - Venue/Time */}
        <div className="mt-auto pt-1.5 sm:pt-3 border-t border-gray-200">
          {/* Venue Name and Time */}
          {(match.venue || timeRange) && (
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {match.venue && (
                <>
                  <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                  <span className="text-[9px] sm:text-xs text-gray-600">{match.venue}</span>
                </>
              )}
              {timeRange && (
                <>
                  {match.venue && <span className="text-[9px] sm:text-xs text-gray-400">•</span>}
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                  <span dir="ltr" className="text-[9px] sm:text-xs text-gray-600 whitespace-nowrap">{timeRange}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Schedule Match Row - single venue layout with time on left
function ScheduleMatchRow({ match, showTime = true, tournament }: { match: MatchWithTeams; showTime?: boolean; tournament?: Tournament }) {
  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const homeWon = isCompleted && homeScore > awayScore;
  const awayWon = isCompleted && awayScore > homeScore;
  
  const matchDate = match.matchDate ? new Date(match.matchDate) : null;
  const timeRange = matchDate ? formatMatchTimeRange(matchDate, 35) : "";
  
  return (
    <Link href={`/matches/${match.id}`}>
      <div
        className={`bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-lg p-2 sm:p-4 cursor-pointer hover:shadow-md transition-all min-h-[100px] sm:min-h-[140px] flex flex-col pb-0 ${isLive ? "ring-2 ring-red-500" : ""}`}
        data-testid={`schedule-row-${match.id}`}
      >
        {/* Match Content */}
        <div className="flex-1 flex items-center gap-2 sm:gap-4">
          {/* Teams and Score - Large Logos with Names */}
          <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4">
            {/* Home Team Section */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1">
              {/* Large Home Team Logo */}
              <div className="flex items-center justify-center">
                {match.homeTeam?.logoUrl ? (
                  <img 
                    src={match.homeTeam.logoUrl} 
                    alt={match.homeTeam.name || "شعار الفريق"}
                    className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 text-gray-400" />
                  </div>
                )}
              </div>
              {/* Home Team Name */}
              <TeamNameDisplay 
                name={match.homeTeam?.name || "فريق غير محدد"}
                className="text-gray-900 font-bold text-center leading-tight text-[9px] sm:text-xs md:text-sm max-w-full"
              />
            </div>
            
            {/* Center Section - Tournament Logo or VS/Score */}
            <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-shrink-0">
              {/* Tournament Logo (if available) */}
              {tournament?.imageUrl && (
                <div className="mb-0.5 sm:mb-1">
                  <img 
                    src={tournament.imageUrl} 
                    alt={tournament.name || "شعار البطولة"}
                    className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
              )}
              {/* Live Badge */}
              {isLive && (
                <Badge className="bg-red-500 text-white animate-pulse text-[8px] sm:text-[10px] md:text-xs mb-0.5 sm:mb-1">مباشر</Badge>
              )}
              {/* Score or VS */}
              {isCompleted || isLive ? (
                <div className="bg-white text-gray-900 border-2 border-gray-300 rounded-lg px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 min-w-[45px] sm:min-w-[60px] md:min-w-[70px] text-center shadow-sm">
                  <div className="text-xs sm:text-base md:text-lg font-bold">
                    {homeScore} - {awayScore}
                  </div>
                </div>
              ) : (
                <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-400">VS</div>
              )}
            </div>
            
            {/* Away Team Section */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1">
              {/* Large Away Team Logo */}
              <div className="flex items-center justify-center">
                {match.awayTeam?.logoUrl ? (
                  <img 
                    src={match.awayTeam.logoUrl} 
                    alt={match.awayTeam.name || "شعار الفريق"}
                    className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 text-gray-400" />
                  </div>
                )}
              </div>
              {/* Away Team Name */}
              <TeamNameDisplay 
                name={match.awayTeam?.name || "فريق غير محدد"}
                className="text-gray-900 font-bold text-center leading-tight text-[9px] sm:text-xs md:text-sm max-w-full"
              />
            </div>
          </div>
          
          {/* Time Column - Only if showTime is true */}
          {showTime && timeRange && (
            <div className="text-center min-w-[70px] sm:min-w-[90px] text-[9px] sm:text-sm text-gray-600 flex-shrink-0 border-r border-gray-200 pr-2 sm:pr-3">
              <div dir="ltr" className="whitespace-nowrap">{timeRange}</div>
            </div>
          )}
        </div>
        
        {/* Bottom Section - Venue/Time */}
        <div className="mt-auto pt-1.5 sm:pt-3 border-t border-gray-200">
          {/* Venue Name and Time */}
          {match.venue && (
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
              <span className="text-[9px] sm:text-xs text-gray-600">{match.venue}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function MatchesView({ matches, tournament }: { matches: MatchWithTeams[]; tournament: Tournament }) {
  const upcomingMatches = matches.filter(m => m.status === "scheduled" || m.status === "live");
  const completedMatches = matches.filter(m => m.status === "completed");
  
  // Group matches by day
  const matchesByDay = matches.reduce((acc, match) => {
    if (!match.matchDate) {
      const key = "غير محدد";
      if (!acc[key]) acc[key] = [];
      acc[key].push(match);
      return acc;
    }
    const dateKey = format(new Date(match.matchDate), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, MatchWithTeams[]>);
  
  const dayKeys = Object.keys(matchesByDay).sort((a, b) => {
    if (a === "غير محدد") return 1;
    if (b === "غير محدد") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  return (
    <div className="space-y-3 sm:space-y-6" dir="ltr">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4" data-testid="matches-summary">
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-base text-muted-foreground">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 flex-shrink-0" />
            <span data-testid="text-upcoming-count" className="text-[10px] sm:text-base">قادمة: {upcomingMatches.length}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <span data-testid="text-completed-count" className="text-[10px] sm:text-base">منتهية: {completedMatches.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Badge variant="outline" className="text-muted-foreground text-[10px] sm:text-sm" data-testid="badge-total-matches">
            إجمالي: {matches.length} مباراة
          </Badge>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-8">
        {dayKeys.map((dayKey) => {
          const dayMatches = matchesByDay[dayKey];
          const completedCount = dayMatches.filter(m => m.status === "completed").length;
          const totalCount = dayMatches.length;
          const formattedDate = dayKey === "غير محدد" 
            ? "تاريخ غير محدد" 
            : format(new Date(dayKey), "EEEE d/MM/yyyy", { locale: ar });
          
          // Sort matches by time
          const sortedDayMatches = [...dayMatches].sort((a, b) => {
            const dateA = a.matchDate ? new Date(a.matchDate).getTime() : 0;
            const dateB = b.matchDate ? new Date(b.matchDate).getTime() : 0;
            return dateA - dateB;
          });
          
          // Group by venue
          const venues = Array.from(new Set(sortedDayMatches.map(m => m.venue || "الملعب الرئيسي")));
          
          // Group by time slot
          const timeSlots = sortedDayMatches.reduce((acc, match) => {
            const timeKey = match.matchDate 
              ? format(new Date(match.matchDate), "HH:mm")
              : "00:00";
            if (!acc[timeKey]) acc[timeKey] = [];
            acc[timeKey].push(match);
            return acc;
          }, {} as Record<string, MatchWithTeams[]>);
          
          const timeSlotKeys = Object.keys(timeSlots).sort();
          
          return (
            <div key={dayKey} data-testid={`card-day-${dayKey}`} className="space-y-2 sm:space-y-4">
              {/* Day Header - Big and Bold */}
              <div className="text-center py-0.5 sm:py-1 px-1.5 sm:px-2 bg-primary text-primary-foreground rounded-lg shadow-sm" dir="rtl">
                <h2 className="text-sm sm:text-xl md:text-2xl font-semibold uppercase tracking-wide">
                  {formattedDate}
                </h2>
              </div>
              
              {/* Venue Headers - Removed, venue name shown inside match cards */}
              
              {/* Time Slots with Matches */}
              <div className="space-y-1.5 sm:space-y-3">
                {timeSlotKeys.map((timeKey) => {
                  const slotMatches = timeSlots[timeKey];
                  const firstMatch = slotMatches[0];
                  const matchDate = firstMatch.matchDate ? new Date(firstMatch.matchDate) : null;
                  const timeRange = matchDate ? formatMatchTimeRange(matchDate, 35) : timeKey;
                  
                  if (venues.length > 1) {
                    // Multi-venue grid layout - time shown inside match cards
                    return (
                      <div 
                        key={timeKey} 
                        className="grid gap-2 sm:gap-4 items-center"
                        style={{ gridTemplateColumns: `repeat(${venues.length}, 1fr)` }}
                      >
                        {/* Match for each venue */}
                        {venues.map((venue) => {
                          const venueMatch = slotMatches.find(m => (m.venue || "الملعب الرئيسي") === venue);
                          if (!venueMatch) {
                            return (
                              <div 
                                key={venue} 
                                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-3 sm:p-6 text-center text-slate-400 min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
                              >
                                —
                              </div>
                            );
                          }
                          return (
                            <ScheduleMatchCell key={venueMatch.id} match={venueMatch} tournament={tournament} />
                          );
                        })}
                      </div>
                    );
                  } else {
                    // Single venue - show all matches in row, time shown inside match cards
                    return (
                      <div key={timeKey} className="space-y-1 sm:space-y-2">
                        {slotMatches.map((match) => (
                          <ScheduleMatchRow key={match.id} match={match} showTime={false} tournament={tournament} />
                        ))}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-medium mb-2">لم يتم إنشاء جدول المباريات بعد</h3>
          <p className="text-base">سيتم عرض جدول المباريات هنا بمجرد إنشائه من لوحة التحكم</p>
        </div>
      )}
    </div>
  );
}

function CompletedMatchCard({ match }: { match: MatchWithTeams }) {
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;
  const isDraw = homeScore === awayScore;

  return (
    <Link href={`/matches/${match.id}`}>
      <motion.div
        whileHover={{ x: -2 }}
        className="bg-muted/30 border rounded-lg p-3 cursor-pointer hover-elevate"
        data-testid={`card-completed-match-${match.id}`}
      >
        <div className="flex items-center gap-4">
          <div className={`flex-1 flex items-center gap-3 justify-end ${homeWon ? "font-bold" : ""}`} data-testid={`completed-match-home-${match.id}`}>
            <TeamNameDisplay 
              name={match.homeTeam?.name || getKnockoutTeamLabel(match, true)}
              className={homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}
            />
            {homeWon && <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
          </div>
          
          <div className="flex items-center gap-3 px-4 py-1 bg-background rounded-full border" data-testid={`completed-match-score-${match.id}`}>
            <span className={`text-base font-bold min-w-[24px] text-center ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {homeScore}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className={`text-base font-bold min-w-[24px] text-center ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {awayScore}
            </span>
          </div>

          <div className={`flex-1 flex items-center gap-3 ${awayWon ? "font-bold" : ""}`} data-testid={`completed-match-away-${match.id}`}>
            {awayWon && <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
            <TeamNameDisplay 
              name={match.awayTeam?.name || getKnockoutTeamLabel(match, false)}
              className={awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-base text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {match.matchDate ? format(new Date(match.matchDate), "dd/MM/yyyy", { locale: ar }) : "غير محدد"}
          </div>
          {isDraw && <Badge variant="outline" className="text-sm">تعادل</Badge>}
          <div className="flex items-center gap-2">
            {match.venue && (
              <>
                <MapPin className="h-3 w-3" />
                <span>{match.venue}</span>
              </>
            )}
            <span className="text-base">{getMatchLabel(match)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function MatchCard({ match }: { match: MatchWithTeams }) {
  const isLive = match.status === "live";
  
  return (
    <Link href={`/matches/${match.id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`bg-card border rounded-lg p-4 cursor-pointer hover-elevate ${isLive ? "ring-2 ring-red-500 ring-offset-2" : ""}`}
        data-testid={`card-match-${match.id}`}
      >
        <div className="flex items-center justify-between mb-3">
          <Badge className={matchStatusColors[match.status]}>
            {isLive && <Play className="h-3 w-3 mr-1" />}
            {matchStatusLabels[match.status]}
          </Badge>
          <div className="text-base text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {match.matchDate ? format(new Date(match.matchDate), "EEEE dd/MM/yyyy - HH:mm", { locale: ar }) : "غير محدد"}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 text-right">
            <TeamNameDisplay 
              name={match.homeTeam?.name || getKnockoutTeamLabel(match, true)}
              className="font-bold text-base"
            />
            <div className="text-base text-muted-foreground">الفريق المضيف</div>
          </div>
          
          <div className="px-6 py-3">
            {isLive ? (
              <div className="text-base font-bold flex items-center gap-2 animate-pulse">
                <span className="text-red-500">{match.homeScore ?? 0}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-red-500">{match.awayScore ?? 0}</span>
              </div>
            ) : (
              <div className="text-base font-bold text-muted-foreground bg-muted px-4 py-2 rounded-lg">VS</div>
            )}
          </div>

          <div className="flex-1 text-right">
            <TeamNameDisplay 
              name={match.awayTeam?.name || getKnockoutTeamLabel(match, false)}
              className="font-bold text-base"
            />
            <div className="text-base text-muted-foreground">الفريق الضيف</div>
          </div>
        </div>

        {match.venue && (
          <div className="mt-3 text-base text-muted-foreground flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            {match.venue}
          </div>
        )}

        <div className="mt-2 flex items-center justify-center gap-4 text-base text-muted-foreground">
          <span>{getMatchLabel(match)}</span>
          {match.stage === "group" && match.groupNumber && (
            <Badge variant="outline" className="text-sm">{groupLabels[match.groupNumber]}</Badge>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
