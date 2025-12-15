import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trophy, ChevronLeft, Users, Calendar, MapPin, Loader2, Flag } from "lucide-react";
import { TeamNameDisplay } from "@/utils/teamNameUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tournament, MatchWithTeams } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const STAGE_ORDER = ["round_of_16", "quarter_final", "semi_final", "final"];
const STAGE_LABELS: Record<string, string> = {
  round_of_16: "دور الـ 16",
  quarter_final: "ربع النهائي",
  semi_final: "نصف النهائي",
  final: "النهائي",
};

function TeamSlot({ 
  team, 
  score, 
  isWinner, 
  ranking,
  showScore = true 
}: { 
  team?: { id: string; name: string; logoUrl?: string | null } | null;
  score?: number | null;
  isWinner?: boolean;
  ranking?: number;
  showScore?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 p-2 border-b last:border-b-0 ${
      isWinner ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-background"
    }`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {team ? (
          <>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <Flag className="w-4 h-4 text-primary" />
              )}
            </div>
            <TeamNameDisplay 
              name={team.name}
              className={`text-base ${isWinner ? "font-bold" : ""}`}
            />
            {ranking && (
              <span className="text-base text-muted-foreground">({ranking})</span>
            )}
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-base text-muted-foreground">TBD</span>
          </>
        )}
      </div>
      {showScore && (
        <div className={`min-w-[32px] h-8 flex items-center justify-center rounded font-bold text-base ${
          isWinner 
            ? "bg-emerald-500 text-white" 
            : score !== null && score !== undefined
              ? "bg-muted text-foreground"
              : "bg-muted/50 text-muted-foreground"
        }`}>
          {score !== null && score !== undefined ? score : "-"}
        </div>
      )}
    </div>
  );
}

function BracketMatchCard({ match }: { match: MatchWithTeams }) {
  const homeWinner = match.status === "completed" && 
    match.homeScore !== null && match.awayScore !== null && 
    match.homeScore > match.awayScore;
  const awayWinner = match.status === "completed" && 
    match.homeScore !== null && match.awayScore !== null && 
    match.awayScore > match.homeScore;

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="w-52 hover-elevate cursor-pointer" data-testid={`bracket-match-${match.id}`}>
        {/* Date Header */}
        {match.matchDate && (
          <div className="text-base text-muted-foreground text-center mb-1 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(match.matchDate), "EEEE dd/MM/yyyy", { locale: ar })}
            {match.matchTime && ` - ${match.matchTime}`}
          </div>
        )}
        
        {/* Match Box */}
        <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
          <TeamSlot 
            team={match.homeTeam} 
            score={match.homeScore} 
            isWinner={homeWinner}
          />
          <TeamSlot 
            team={match.awayTeam} 
            score={match.awayScore} 
            isWinner={awayWinner}
          />
        </div>

        {/* Penalty Score */}
        {match.homePenaltyScore !== null && match.awayPenaltyScore !== null && (
          <div className="text-base text-center text-muted-foreground mt-1">
            ركلات الترجيح: {match.homePenaltyScore} - {match.awayPenaltyScore}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex justify-center mt-1">
          <Badge 
            variant="outline" 
            className={`text-base ${
              match.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
              match.status === "live" ? "bg-red-500 text-white animate-pulse" :
              "bg-muted"
            }`}
          >
            {match.status === "completed" ? "انتهت" :
             match.status === "live" ? "مباشر" :
             match.status === "postponed" ? "مؤجلة" : "قادمة"}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

function BracketConnector({ matchCount, direction = "left" }: { matchCount: number; direction?: "left" | "right" }) {
  if (matchCount <= 1) {
    return (
      <div className="w-12 flex items-center justify-center">
        <div className="w-full h-px bg-border" />
      </div>
    );
  }

  return (
    <div className="w-12 flex flex-col justify-center relative">
      <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-border" />
      </svg>
    </div>
  );
}

function BracketColumn({ 
  stage, 
  matches,
  isFirst,
  isLast
}: { 
  stage: string; 
  matches: MatchWithTeams[];
  isFirst: boolean;
  isLast: boolean;
}) {
  const stageMatches = matches
    .filter(m => m.stage === stage)
    .sort((a, b) => (a.round || 0) - (b.round || 0));

  const getGap = () => {
    switch (stage) {
      case "round_of_16": return "gap-2";
      case "quarter_final": return "gap-8";
      case "semi_final": return "gap-24";
      case "final": return "gap-0";
      default: return "gap-4";
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Stage Header */}
      <div className={`mb-4 px-4 py-2 rounded-lg text-center ${
        stage === "final" 
          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900" 
          : "bg-primary/10"
      }`}>
        <div className="flex items-center gap-2 justify-center">
          {stage === "final" && <Trophy className="w-4 h-4" />}
          <span className="font-bold text-base">{STAGE_LABELS[stage]}</span>
        </div>
      </div>

      {/* Matches */}
      <div className={`flex flex-col ${getGap()} justify-center flex-1`}>
        {stageMatches.length > 0 ? (
          stageMatches.map((match) => (
            <div key={match.id} className="flex items-center">
              {!isFirst && <BracketConnector matchCount={stageMatches.length} direction="right" />}
              <BracketMatchCard match={match} />
              {!isLast && <BracketConnector matchCount={stageMatches.length} direction="left" />}
            </div>
          ))
        ) : (
          <div className="w-52 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-base">
            لم تحدد بعد
          </div>
        )}
      </div>
    </div>
  );
}

function EnhancedBracketTree({ matches, tournamentName }: { matches: MatchWithTeams[]; tournamentName?: string }) {
  const knockoutMatches = matches.filter(m => m.stage && m.stage !== "group");
  
  if (knockoutMatches.length === 0) {
    return (
      <Card className="text-center p-12">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">لا توجد مباريات تصفيات</h3>
        <p className="text-muted-foreground">
          لم يتم جدولة مباريات خروج المغلوب بعد
        </p>
      </Card>
    );
  }

  // Get available stages in order (RTL: final first visually on left)
  const availableStages = STAGE_ORDER.filter(stage => 
    knockoutMatches.some(m => m.stage === stage)
  ).reverse(); // Reverse for RTL layout

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Trophy className="h-6 w-6 text-primary" />
          {tournamentName} خروج المغلوب
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto pb-4" dir="ltr">
          <div className="flex items-stretch justify-center gap-4 min-w-max py-4">
            {availableStages.map((stage, index) => (
              <div key={stage} className="flex items-center">
                <BracketColumn 
                  stage={stage} 
                  matches={knockoutMatches}
                  isFirst={index === 0}
                  isLast={index === availableStages.length - 1}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TournamentWinner({ matches }: { matches: MatchWithTeams[] }) {
  const finalMatch = matches.find(m => m.stage === "final" && m.status === "completed");
  
  if (!finalMatch || finalMatch.homeScore === null || finalMatch.awayScore === null) {
    return null;
  }

  const winner = finalMatch.homeScore > finalMatch.awayScore 
    ? finalMatch.homeTeam 
    : finalMatch.awayScore > finalMatch.homeScore 
      ? finalMatch.awayTeam 
      : null;

  if (!winner) return null;

  return (
    <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-300 dark:border-yellow-700">
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-4">
          <Trophy className="w-10 h-10 text-yellow-900" />
        </div>
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          البطل
          <Trophy className="w-6 h-6 text-yellow-600" />
        </h2>
        <p className="text-base font-display font-bold text-yellow-700 dark:text-yellow-400">
          {winner.name}
        </p>
      </CardContent>
    </Card>
  );
}

function MatchResultsList({ matches }: { matches: MatchWithTeams[] }) {
  const completedMatches = matches
    .filter(m => m.status === "completed")
    .sort((a, b) => {
      if (a.matchDate && b.matchDate) {
        return new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime();
      }
      return 0;
    });

  if (completedMatches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>لا توجد نتائج بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {completedMatches.map((match) => {
        const homeWinner = match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore;
        const awayWinner = match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore;
        
        return (
          <Link key={match.id} href={`/matches/${match.id}`}>
            <Card className="hover-elevate cursor-pointer" data-testid={`result-match-${match.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Home Team */}
                  <div className={`flex items-center gap-2 flex-1 justify-end ${homeWinner ? "font-bold" : ""}`}>
                    <span className="text-base truncate">{match.homeTeam?.name || "فريق 1"}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-1">
                    <div className={`w-8 h-8 flex items-center justify-center rounded font-bold ${
                      homeWinner ? "bg-emerald-500 text-white" : "bg-muted"
                    }`}>
                      {match.homeScore ?? "-"}
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className={`w-8 h-8 flex items-center justify-center rounded font-bold ${
                      awayWinner ? "bg-emerald-500 text-white" : "bg-muted"
                    }`}>
                      {match.awayScore ?? "-"}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className={`flex items-center gap-2 flex-1 ${awayWinner ? "font-bold" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4 h-4" />
                    </div>
                    <span className="text-base truncate">{match.awayTeam?.name || "فريق 2"}</span>
                  </div>
                </div>

                {/* Match Info */}
                <div className="flex items-center justify-center gap-4 mt-2 text-base text-muted-foreground">
                  {match.matchDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(match.matchDate), "dd/MM/yyyy", { locale: ar })}
                    </span>
                  )}
                  {match.stage && (
                    <Badge variant="outline" className="text-sm">
                      {STAGE_LABELS[match.stage] || match.stage}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function Bracket() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"bracket" | "results">("bracket");

  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<MatchWithTeams[]>({
    queryKey: [`/api/tournaments/${selectedTournamentId}/matches`],
    enabled: !!selectedTournamentId,
  });

  const knockoutTournaments = tournaments.filter(t => 
    t.type === "knockout" || t.type === "groups_knockout"
  );

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              شجرة التصفيات
            </h1>
            <p className="text-muted-foreground mt-1">
              تتبع مسار الفرق في مراحل خروج المغلوب
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
              <SelectTrigger className="w-[280px]" data-testid="select-tournament-bracket">
                <SelectValue placeholder="اختر البطولة" />
              </SelectTrigger>
              <SelectContent>
                {tournamentsLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : knockoutTournaments.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-base">
                    لا توجد بطولات تصفيات
                  </div>
                ) : (
                  knockoutTournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </SelectItem>
                  ))
                )}
                {tournaments.filter(t => t.type !== "knockout" && t.type !== "groups_knockout").length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-base text-muted-foreground border-t mt-1">
                      بطولات أخرى (دوري)
                    </div>
                    {tournaments.filter(t => t.type !== "knockout" && t.type !== "groups_knockout").map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id}>
                        {tournament.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!selectedTournamentId ? (
          <Card className="text-center p-12">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">اختر بطولة</h3>
            <p className="text-muted-foreground">
              اختر بطولة من القائمة لعرض شجرة التصفيات
            </p>
          </Card>
        ) : matchesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tournament Info */}
            {selectedTournament && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {selectedTournament.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-base text-muted-foreground">
                    {selectedTournament.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedTournament.startDate).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                    {selectedTournament.venues && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {Array.isArray(selectedTournament.venues) 
                          ? selectedTournament.venues.join(", ") 
                          : selectedTournament.venues}
                      </span>
                    )}
                    <Badge>
                      {selectedTournament.type === "knockout" ? "خروج مغلوب" :
                       selectedTournament.type === "groups_knockout" ? "مجموعات + تصفيات" :
                       "دوري"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 justify-center">
              <Badge 
                variant={viewMode === "bracket" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setViewMode("bracket")}
                data-testid="view-bracket"
              >
                شجرة التصفيات
              </Badge>
              <Badge 
                variant={viewMode === "results" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setViewMode("results")}
                data-testid="view-results"
              >
                النتائج
              </Badge>
            </div>

            {/* Winner */}
            <TournamentWinner matches={matches} />
            
            {/* Content */}
            {viewMode === "bracket" ? (
              <EnhancedBracketTree 
                matches={matches} 
                tournamentName={selectedTournament?.name}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    نتائج المباريات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MatchResultsList matches={matches} />
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">مفتاح الألوان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-base">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-500 rounded text-white flex items-center justify-center text-base font-bold">2</div>
                    <span>الفائز</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-muted rounded flex items-center justify-center text-base font-bold">1</div>
                    <span>الخاسر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-500 text-white text-sm">مباشر</Badge>
                    <span>مباراة جارية</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
