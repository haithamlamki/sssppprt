import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Swords,
  Shield,
  BarChart3
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tournament, Team, MatchWithTeams, PlayerWithTeam } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import KnockoutBracket from "@/components/KnockoutBracket";

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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{groupNumber}</span>
                </div>
                {groupLabels[groupNumber] || `المجموعة ${groupNumber}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/50">
                      <TableHead className="text-center w-10 px-1">#</TableHead>
                      <TableHead className="text-right px-2">الفريق</TableHead>
                      <TableHead className="text-center px-1 w-10">لعب</TableHead>
                      <TableHead className="text-center px-1 w-10">ف</TableHead>
                      <TableHead className="text-center px-1 w-10">ت</TableHead>
                      <TableHead className="text-center px-1 w-10">خ</TableHead>
                      <TableHead className="text-center px-1 w-10">له</TableHead>
                      <TableHead className="text-center px-1 w-10">عليه</TableHead>
                      <TableHead className="text-center px-1 w-10">فارق</TableHead>
                      <TableHead className="text-center px-2 w-12 font-bold bg-primary/5">نقاط</TableHead>
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
                          <TableCell className="font-bold px-1 text-sm text-center">
                            {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 mx-auto" />}
                            {index > 0 && index + 1}
                          </TableCell>
                          <TableCell className="font-medium px-2 text-sm">{team.name}</TableCell>
                          <TableCell className="text-center px-1 text-sm">{team.played}</TableCell>
                          <TableCell className="text-center px-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{team.won}</TableCell>
                          <TableCell className="text-center px-1 text-sm text-muted-foreground">{team.drawn}</TableCell>
                          <TableCell className="text-center px-1 text-sm text-red-600 dark:text-red-400">{team.lost}</TableCell>
                          <TableCell className="text-center px-1 text-sm">{team.goalsFor}</TableCell>
                          <TableCell className="text-center px-1 text-sm">{team.goalsAgainst}</TableCell>
                          <TableCell className="text-center px-1 text-sm">
                            <span className={team.goalDifference > 0 ? "text-emerald-600 dark:text-emerald-400" : team.goalDifference < 0 ? "text-red-600 dark:text-red-400" : ""}>
                              {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                            </span>
                          </TableCell>
                          <TableCell className="text-center px-2 font-bold text-lg bg-primary/5">{team.points}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-500/20" />
                  <span>يتأهل للأدوار الإقصائية</span>
                </div>
              </div>

              {groupMatches.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    مباريات المجموعة
                  </h4>
                  <div className="space-y-2">
                    {groupMatches.slice(0, 4).map((match) => (
                      <GroupMatchCard key={match.id} match={match} />
                    ))}
                    {groupMatches.length > 4 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{groupMatches.length - 4} مباريات أخرى
                      </p>
                    )}
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
        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm cursor-pointer hover-elevate"
        data-testid={`group-match-${match.id}`}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className={`font-medium ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
            {match.homeTeam?.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-3">
          {isCompleted ? (
            <>
              <span className={`font-bold min-w-[20px] text-center ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                {match.homeScore}
              </span>
              <span className="text-muted-foreground">-</span>
              <span className={`font-bold min-w-[20px] text-center ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                {match.awayScore}
              </span>
            </>
          ) : (
            <Badge variant="outline" className="text-xs">
              {matchStatusLabels[match.status]}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className={`font-medium ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
            {match.awayTeam?.name}
          </span>
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

  const { data: topScorers } = useQuery<PlayerWithTeam[]>({
    queryKey: ["/api/tournaments", tournamentId, "top-scorers"],
    enabled: !!tournamentId,
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
        <h2 className="text-xl font-medium">البطولة غير موجودة</h2>
        <Link href="/leagues">
          <Button>
            <ArrowRight className="ml-2 h-4 w-4" />
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
        className={`relative text-white py-16 ${!hasCustomTheme ? 'bg-gradient-to-br from-primary via-primary/90 to-primary/80' : ''}`}
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
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للبطولات
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{tournament.name}</h1>
              <p className="text-lg opacity-90 max-w-2xl">{tournament.description}</p>
            </div>

            {tournament.status === "registration" && isAuthenticated && (
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-register-team">
                    <Plus className="ml-2 h-5 w-5" />
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{sportLabels[tournament.sport]}</div>
              <div className="text-sm opacity-80">الرياضة</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Award className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{typeLabels[tournament.type]?.split(" ")[0]}</div>
              <div className="text-sm opacity-80">نوع البطولة</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{teams?.length || 0} / {tournament.maxTeams}</div>
              <div className="text-sm opacity-80">الفرق المسجلة</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{matches?.length || 0}</div>
              <div className="text-sm opacity-80">المباريات</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="standings" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-6">
            <TabsTrigger value="standings" data-testid="tab-standings">الترتيب</TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches">المباريات</TabsTrigger>
            <TabsTrigger value="knockout" data-testid="tab-knockout">
              <Swords className="h-4 w-4 ml-1" />
              التصفيات
            </TabsTrigger>
            <TabsTrigger value="scorers" data-testid="tab-scorers">الهدافين</TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">
              <BarChart3 className="h-4 w-4 ml-1" />
              إحصائيات
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams">الفرق</TabsTrigger>
          </TabsList>

          <TabsContent value="standings">
            {tournament.hasGroupStage ? (
              <GroupStandings standings={groupStandings} matches={matches} isLoading={standingsLoading} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-gold" />
                    جدول الترتيب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedTeams.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right w-12">#</TableHead>
                            <TableHead className="text-right">الفريق</TableHead>
                            <TableHead className="text-center">لعب</TableHead>
                            <TableHead className="text-center">فاز</TableHead>
                            <TableHead className="text-center">تعادل</TableHead>
                            <TableHead className="text-center">خسر</TableHead>
                            <TableHead className="text-center">له</TableHead>
                            <TableHead className="text-center">عليه</TableHead>
                            <TableHead className="text-center">الفارق</TableHead>
                            <TableHead className="text-center font-bold">النقاط</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedTeams.map((team, index) => (
                            <TableRow 
                              key={team.id} 
                              className={index < 3 ? "bg-primary/5" : ""}
                              data-testid={`row-team-${team.id}`}
                            >
                              <TableCell className="font-bold">
                                {index === 0 && <span className="text-gold">🥇</span>}
                                {index === 1 && <span className="text-gray-400">🥈</span>}
                                {index === 2 && <span className="text-amber-600">🥉</span>}
                                {index > 2 && index + 1}
                              </TableCell>
                              <TableCell className="font-medium">{team.name}</TableCell>
                              <TableCell className="text-center">{team.played}</TableCell>
                              <TableCell className="text-center text-emerald-500">{team.won}</TableCell>
                              <TableCell className="text-center text-gray-500">{team.drawn}</TableCell>
                              <TableCell className="text-center text-red-500">{team.lost}</TableCell>
                              <TableCell className="text-center">{team.goalsFor}</TableCell>
                              <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                              <TableCell className="text-center">
                                <span className={team.goalDifference > 0 ? "text-emerald-500" : team.goalDifference < 0 ? "text-red-500" : ""}>
                                  {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                                </span>
                              </TableCell>
                              <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
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

          <TabsContent value="matches" className="space-y-6">
            <MatchesView matches={matches || []} />
          </TabsContent>

          <TabsContent value="knockout">
            <KnockoutBracket 
              matches={matches || []} 
              tournament={tournament}
              groupStageComplete={tournament?.currentStage !== 'group_stage'}
            />
          </TabsContent>

          <TabsContent value="scorers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  قائمة الهدافين
                </CardTitle>
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
                            <TableCell className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {player.name}
                              <Badge variant="outline" className="text-xs">
                                #{player.number}
                              </Badge>
                            </TableCell>
                            <TableCell>{player.team?.name}</TableCell>
                            <TableCell className="text-center font-bold text-lg">{player.goals}</TableCell>
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

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    أفضل دفاع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teams && teams.length > 0 ? (
                    <div className="space-y-3">
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
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            data-testid={`row-defense-${team.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                                index === 1 ? "bg-gray-400/20 text-gray-600" :
                                index === 2 ? "bg-amber-600/20 text-amber-700" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-medium">{team.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-500">{team.goalsAgainst}</div>
                                <div className="text-xs text-muted-foreground">أهداف ضده</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold">{(team.goalsAgainst / (team.played || 1)).toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">معدل/مباراة</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {teams.filter(t => t.played > 0).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p>لا توجد مباريات منتهية بعد</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>لا توجد فرق مسجلة بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-500" />
                    أفضل هجوم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teams && teams.length > 0 ? (
                    <div className="space-y-3">
                      {[...teams]
                        .filter(t => t.played > 0)
                        .sort((a, b) => b.goalsFor - a.goalsFor)
                        .slice(0, 5)
                        .map((team, index) => (
                          <div 
                            key={team.id} 
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            data-testid={`row-attack-${team.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                                index === 1 ? "bg-gray-400/20 text-gray-600" :
                                index === 2 ? "bg-amber-600/20 text-amber-700" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-medium">{team.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-emerald-500">{team.goalsFor}</div>
                                <div className="text-xs text-muted-foreground">أهداف له</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold">{(team.goalsFor / (team.played || 1)).toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">معدل/مباراة</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {teams.filter(t => t.played > 0).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p>لا توجد مباريات منتهية بعد</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>لا توجد فرق مسجلة بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-5 bg-yellow-500 rounded-sm" />
                    <div className="w-4 h-5 bg-red-500 rounded-sm" />
                  </div>
                  سجل البطاقات
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
                              <TableCell className="font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {player.name}
                                <Badge variant="outline" className="text-xs">#{player.number}</Badge>
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
                  <div className="text-3xl font-bold text-primary">{matches?.filter(m => m.status === "completed").length || 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">مباريات منتهية</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-emerald-500">
                    {matches?.filter(m => m.status === "completed").reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">إجمالي الأهداف</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-yellow-500">
                    {topScorers?.reduce((sum, p) => sum + (p.yellowCards || 0), 0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">بطاقات صفراء</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-red-500">
                    {topScorers?.reduce((sum, p) => sum + (p.redCards || 0), 0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">بطاقات حمراء</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams?.map((team) => (
                <Card key={team.id} className="hover-elevate" data-testid={`card-team-${team.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {team.points} نقطة
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-emerald-500/10 rounded p-2">
                        <div className="font-bold text-emerald-500">{team.won}</div>
                        <div className="text-xs text-muted-foreground">فوز</div>
                      </div>
                      <div className="bg-gray-500/10 rounded p-2">
                        <div className="font-bold text-gray-500">{team.drawn}</div>
                        <div className="text-xs text-muted-foreground">تعادل</div>
                      </div>
                      <div className="bg-red-500/10 rounded p-2">
                        <div className="font-bold text-red-500">{team.lost}</div>
                        <div className="text-xs text-muted-foreground">خسارة</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!teams || teams.length === 0) && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لم يتم تسجيل أي فرق بعد</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Format time range for match (e.g., "4:10-4:45 م")
// Default duration: 2 halves of 20 min + 5 min break = 45 min (typical for company tournaments)
function formatMatchTimeRange(matchDate: Date, durationMinutes: number = 45): string {
  const startHour = matchDate.getHours();
  const startMin = matchDate.getMinutes();
  
  // Ensure valid duration
  const duration = typeof durationMinutes === 'number' && !isNaN(durationMinutes) && durationMinutes > 0 
    ? durationMinutes 
    : 45;
  
  const endDate = new Date(matchDate.getTime() + duration * 60 * 1000);
  const endHour = endDate.getHours();
  const endMin = endDate.getMinutes();
  
  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "م" : "ص";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };
  
  return `${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}`;
}

// Schedule Match Cell - for grid layout with multiple venues
function ScheduleMatchCell({ match }: { match: MatchWithTeams }) {
  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const homeWon = isCompleted && homeScore > awayScore;
  const awayWon = isCompleted && awayScore > homeScore;
  
  return (
    <Link href={`/matches/${match.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-3 bg-card border rounded-xl cursor-pointer hover-elevate ${isLive ? "ring-2 ring-red-500" : ""}`}
        data-testid={`schedule-cell-${match.id}`}
      >
        <div className="flex items-center gap-2 justify-center">
          {/* Home Team */}
          <TeamBox 
            team={match.homeTeam} 
            showLogo={true}
            isWinner={homeWon}
            score={isCompleted || isLive ? homeScore : undefined}
          />
          
          {/* VS or Score */}
          <div className="px-2 flex flex-col items-center">
            {isLive && <Badge className="bg-red-500 animate-pulse text-xs mb-1">مباشر</Badge>}
            {!isCompleted && !isLive && (
              <span className="text-lg font-bold text-muted-foreground">VS</span>
            )}
            {isCompleted && (
              <span className="text-xs text-muted-foreground">انتهت</span>
            )}
          </div>
          
          {/* Away Team */}
          <TeamBox 
            team={match.awayTeam} 
            showLogo={true}
            isWinner={awayWon}
            score={isCompleted || isLive ? awayScore : undefined}
          />
        </div>
        
        <div className="text-center mt-2 text-xs text-muted-foreground">
          {getMatchLabel(match)}
          {match.leg === 2 && " - إياب"}
        </div>
      </motion.div>
    </Link>
  );
}

// Schedule Match Row - single venue layout with time on left
function ScheduleMatchRow({ match, showTime = true }: { match: MatchWithTeams; showTime?: boolean }) {
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
      <motion.div
        whileHover={{ x: -3 }}
        className={`flex items-center gap-4 p-3 bg-card border rounded-xl cursor-pointer hover-elevate ${isLive ? "ring-2 ring-red-500" : ""}`}
        data-testid={`schedule-row-${match.id}`}
      >
        {/* Time Column */}
        {showTime && (
          <div className="min-w-[90px] text-center py-2 px-3 bg-primary/10 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
            <span className="text-xs font-medium text-primary">{timeRange}</span>
          </div>
        )}
        
        {/* Match Content */}
        <div className="flex-1 flex items-center justify-center gap-3">
          {/* Home Team */}
          <div className="flex-1">
            <TeamBox 
              team={match.homeTeam} 
              showLogo={true}
              isWinner={homeWon}
              score={isCompleted || isLive ? homeScore : undefined}
            />
          </div>
          
          {/* VS or Status */}
          <div className="px-3 flex flex-col items-center">
            {isLive && <Badge className="bg-red-500 animate-pulse">مباشر</Badge>}
            {!isCompleted && !isLive && (
              <span className="text-xl font-bold text-muted-foreground bg-muted px-3 py-1 rounded-lg">VS</span>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="text-xs">انتهت</Badge>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex-1">
            <TeamBox 
              team={match.awayTeam} 
              showLogo={true}
              isWinner={awayWon}
              score={isCompleted || isLive ? awayScore : undefined}
            />
          </div>
        </div>
        
        {/* Info Column */}
        <div className="text-right min-w-[80px]">
          <div className="text-xs text-muted-foreground">{getMatchLabel(match)}</div>
          {match.venue && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
              <MapPin className="h-3 w-3" />
              {match.venue}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

function MatchesView({ matches }: { matches: MatchWithTeams[] }) {
  const [viewMode, setViewMode] = useState<"status" | "round" | "day">("day");
  
  const upcomingMatches = matches.filter(m => m.status === "scheduled" || m.status === "live");
  const completedMatches = matches.filter(m => m.status === "completed");
  
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.round || 1;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<number, MatchWithTeams[]>);
  
  const roundNumbers = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
  
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4" data-testid="matches-summary">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span data-testid="text-upcoming-count">قادمة: {upcomingMatches.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span data-testid="text-completed-count">منتهية: {completedMatches.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground" data-testid="badge-total-matches">
            إجمالي: {matches.length} مباراة
          </Badge>
          <div className="flex border rounded-lg overflow-hidden">
            <Button 
              variant={viewMode === "day" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("day")}
              className="rounded-none"
              data-testid="button-view-by-day"
            >
              حسب اليوم
            </Button>
            <Button 
              variant={viewMode === "round" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("round")}
              className="rounded-none"
              data-testid="button-view-by-round"
            >
              حسب الجولة
            </Button>
            <Button 
              variant={viewMode === "status" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("status")}
              className="rounded-none"
              data-testid="button-view-by-status"
            >
              حسب الحالة
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "day" ? (
        <div className="space-y-8">
          {dayKeys.map((dayKey) => {
            const dayMatches = matchesByDay[dayKey];
            const completedCount = dayMatches.filter(m => m.status === "completed").length;
            const totalCount = dayMatches.length;
            const formattedDate = dayKey === "غير محدد" 
              ? "تاريخ غير محدد" 
              : format(new Date(dayKey), "EEEE d MMMM", { locale: ar });
            
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
              <div key={dayKey} data-testid={`card-day-${dayKey}`} className="space-y-4">
                {/* Day Header - Big and Bold */}
                <div className="text-center py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
                    {formattedDate}
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <Badge className="bg-white/20 text-white border-none">
                      {totalCount} مباريات
                    </Badge>
                    {completedCount === totalCount && totalCount > 0 && (
                      <Badge className="bg-emerald-400 text-white border-none">مكتملة</Badge>
                    )}
                  </div>
                </div>
                
                {/* Venue Headers */}
                {venues.length > 1 && (
                  <div className="grid gap-4" style={{ gridTemplateColumns: `80px repeat(${venues.length}, 1fr)` }}>
                    <div></div>
                    {venues.map((venue, idx) => (
                      <div key={venue} className="text-center py-2 bg-muted/50 rounded-lg font-bold text-sm">
                        <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        {venue}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Time Slots with Matches */}
                <div className="space-y-3">
                  {timeSlotKeys.map((timeKey) => {
                    const slotMatches = timeSlots[timeKey];
                    const firstMatch = slotMatches[0];
                    const matchDate = firstMatch.matchDate ? new Date(firstMatch.matchDate) : null;
                    const timeRange = matchDate ? formatMatchTimeRange(matchDate, 35) : timeKey;
                    
                    if (venues.length > 1) {
                      // Multi-venue grid layout
                      return (
                        <div 
                          key={timeKey} 
                          className="grid gap-4 items-center"
                          style={{ gridTemplateColumns: `80px repeat(${venues.length}, 1fr)` }}
                        >
                          {/* Time Column */}
                          <div className="text-center py-2 bg-primary/10 rounded-lg">
                            <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <span className="text-xs font-medium text-primary">{timeRange}</span>
                          </div>
                          
                          {/* Match for each venue */}
                          {venues.map((venue) => {
                            const venueMatch = slotMatches.find(m => (m.venue || "الملعب الرئيسي") === venue);
                            if (!venueMatch) {
                              return <div key={venue} className="p-4 bg-muted/20 rounded-lg text-center text-muted-foreground text-sm">-</div>;
                            }
                            return (
                              <ScheduleMatchCell key={venueMatch.id} match={venueMatch} />
                            );
                          })}
                        </div>
                      );
                    } else {
                      // Single venue - show all matches in row with time
                      return (
                        <div key={timeKey} className="space-y-2">
                          {slotMatches.map((match) => (
                            <ScheduleMatchRow key={match.id} match={match} showTime={true} />
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
      ) : viewMode === "round" ? (
        <div className="space-y-6">
          {roundNumbers.map((roundNum) => {
            const roundMatches = matchesByRound[roundNum];
            const completedCount = roundMatches.filter(m => m.status === "completed").length;
            const totalCount = roundMatches.length;
            
            return (
              <Card key={roundNum} data-testid={`card-round-${roundNum}`}>
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{roundNum}</span>
                      </div>
                      <span>الجولة {roundNum}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {completedCount}/{totalCount} مباريات
                      </Badge>
                      {completedCount === totalCount && (
                        <Badge className="bg-emerald-500 text-xs">مكتملة</Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {roundMatches
                    .sort((a, b) => {
                      const dateA = a.matchDate ? new Date(a.matchDate).getTime() : 0;
                      const dateB = b.matchDate ? new Date(b.matchDate).getTime() : 0;
                      return dateA - dateB;
                    })
                    .map((match) => (
                      match.status === "completed" ? 
                        <CompletedMatchCard key={match.id} match={match} /> :
                        <MatchCard key={match.id} match={match} />
                    ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {upcomingMatches.length > 0 && (
            <Card className="border-blue-500/20">
              <CardHeader className="bg-blue-500/5 border-b border-blue-500/10">
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Clock className="h-5 w-5" />
                  المباريات القادمة
                  <Badge variant="secondary" className="mr-auto text-xs">
                    {upcomingMatches.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {upcomingMatches
                  .sort((a, b) => {
                    const dateA = a.matchDate ? new Date(a.matchDate).getTime() : 0;
                    const dateB = b.matchDate ? new Date(b.matchDate).getTime() : 0;
                    return dateA - dateB;
                  })
                  .map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
              </CardContent>
            </Card>
          )}

          {completedMatches.length > 0 && (
            <Card className="border-emerald-500/20">
              <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10">
                <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  المباريات المنتهية
                  <Badge variant="secondary" className="mr-auto text-xs">
                    {completedMatches.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {completedMatches
                  .sort((a, b) => {
                    const dateA = a.matchDate ? new Date(a.matchDate).getTime() : 0;
                    const dateB = b.matchDate ? new Date(b.matchDate).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map((match) => (
                    <CompletedMatchCard key={match.id} match={match} />
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">لم يتم إنشاء جدول المباريات بعد</h3>
          <p className="text-sm">سيتم عرض جدول المباريات هنا بمجرد إنشائه من لوحة التحكم</p>
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
            <span className={homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}>{match.homeTeam?.name || getKnockoutTeamLabel(match, true)}</span>
            {homeWon && <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
          </div>
          
          <div className="flex items-center gap-3 px-4 py-1 bg-background rounded-full border" data-testid={`completed-match-score-${match.id}`}>
            <span className={`text-xl font-bold min-w-[24px] text-center ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {homeScore}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className={`text-xl font-bold min-w-[24px] text-center ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {awayScore}
            </span>
          </div>

          <div className={`flex-1 flex items-center gap-3 ${awayWon ? "font-bold" : ""}`} data-testid={`completed-match-away-${match.id}`}>
            {awayWon && <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
            <span className={awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}>{match.awayTeam?.name || getKnockoutTeamLabel(match, false)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {match.matchDate ? format(new Date(match.matchDate), "dd/MM/yyyy", { locale: ar }) : "غير محدد"}
          </div>
          {isDraw && <Badge variant="outline" className="text-xs">تعادل</Badge>}
          <div className="flex items-center gap-2">
            {match.venue && (
              <>
                <MapPin className="h-3 w-3" />
                <span>{match.venue}</span>
              </>
            )}
            <span className="text-xs">{getMatchLabel(match)}</span>
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
            {isLive && <Play className="h-3 w-3 ml-1" />}
            {matchStatusLabels[match.status]}
          </Badge>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {match.matchDate ? format(new Date(match.matchDate), "EEEE dd/MM/yyyy - HH:mm", { locale: ar }) : "غير محدد"}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 text-right">
            <div className="font-bold text-lg">{match.homeTeam?.name || getKnockoutTeamLabel(match, true)}</div>
            <div className="text-xs text-muted-foreground">الفريق المضيف</div>
          </div>
          
          <div className="px-6 py-3">
            {isLive ? (
              <div className="text-2xl font-bold flex items-center gap-2 animate-pulse">
                <span className="text-red-500">{match.homeScore ?? 0}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-red-500">{match.awayScore ?? 0}</span>
              </div>
            ) : (
              <div className="text-xl font-bold text-muted-foreground bg-muted px-4 py-2 rounded-lg">VS</div>
            )}
          </div>

          <div className="flex-1 text-left">
            <div className="font-bold text-lg">{match.awayTeam?.name || getKnockoutTeamLabel(match, false)}</div>
            <div className="text-xs text-muted-foreground">الفريق الضيف</div>
          </div>
        </div>

        {match.venue && (
          <div className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            {match.venue}
          </div>
        )}

        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>{getMatchLabel(match)}</span>
          {match.stage === "group" && match.groupNumber && (
            <Badge variant="outline" className="text-xs">{groupLabels[match.groupNumber]}</Badge>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
