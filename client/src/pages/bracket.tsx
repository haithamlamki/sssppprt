import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trophy, ChevronLeft, Users, Calendar, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tournament, MatchWithTeams } from "@shared/schema";

const STAGE_ORDER = ["round_of_16", "quarter_final", "semi_final", "final"];
const STAGE_LABELS: Record<string, string> = {
  round_of_16: "دور الـ 16",
  quarter_final: "ربع النهائي",
  semi_final: "نصف النهائي",
  final: "النهائي",
};

function MatchCard({ match, isRTL = true }: { match: MatchWithTeams; isRTL?: boolean }) {
  const homeWinner = match.status === "completed" && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore;
  const awayWinner = match.status === "completed" && match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore;
  const isDraw = match.status === "completed" && match.homeScore === match.awayScore;

  return (
    <Link href={`/matches/${match.id}`}>
      <Card 
        className="w-56 hover-elevate cursor-pointer border-2 transition-all duration-200"
        data-testid={`bracket-match-${match.id}`}
      >
        <CardContent className="p-3">
          <div className="space-y-2">
            <div 
              className={`flex items-center justify-between p-2 rounded ${
                homeWinner ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-3 h-3 text-primary" />
                </div>
                <span className={`text-sm truncate ${homeWinner ? "font-bold" : ""}`}>
                  {match.homeTeam?.name || "فريق 1"}
                </span>
              </div>
              <span className={`text-lg font-bold min-w-[24px] text-center ${homeWinner ? "text-emerald-600" : ""}`}>
                {match.homeScore ?? "-"}
              </span>
            </div>
            
            <div 
              className={`flex items-center justify-between p-2 rounded ${
                awayWinner ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 bg-secondary/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-3 h-3" />
                </div>
                <span className={`text-sm truncate ${awayWinner ? "font-bold" : ""}`}>
                  {match.awayTeam?.name || "فريق 2"}
                </span>
              </div>
              <span className={`text-lg font-bold min-w-[24px] text-center ${awayWinner ? "text-emerald-600" : ""}`}>
                {match.awayScore ?? "-"}
              </span>
            </div>

            {match.homePenaltyScore !== null && match.awayPenaltyScore !== null && (
              <div className="text-xs text-center text-muted-foreground">
                ركلات الترجيح: {match.homePenaltyScore} - {match.awayPenaltyScore}
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {match.matchDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(match.matchDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                </span>
              )}
              <Badge 
                variant="outline" 
                className={`text-[10px] ${
                  match.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" :
                  match.status === "live" ? "bg-red-100 text-red-700 dark:bg-red-900/30 animate-pulse" :
                  ""
                }`}
              >
                {match.status === "completed" ? "انتهت" :
                 match.status === "live" ? "مباشر" :
                 match.status === "postponed" ? "مؤجلة" : "قادمة"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function BracketConnector({ direction }: { direction: "right" | "left" }) {
  return (
    <div className="flex items-center">
      <div className={`w-8 h-px bg-border ${direction === "right" ? "ml-0" : "mr-0"}`} />
    </div>
  );
}

function BracketStage({ 
  stage, 
  matches, 
  isLast 
}: { 
  stage: string; 
  matches: MatchWithTeams[]; 
  isLast: boolean;
}) {
  const stageMatches = matches.filter(m => m.stage === stage);
  
  if (stageMatches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Badge variant="outline" className="mb-2">{STAGE_LABELS[stage]}</Badge>
        <div className="text-muted-foreground text-sm text-center p-4">
          لم يتم تحديد المباريات بعد
        </div>
      </div>
    );
  }

  const getSpacing = () => {
    switch (stage) {
      case "round_of_16": return "gap-4";
      case "quarter_final": return "gap-12";
      case "semi_final": return "gap-24";
      case "final": return "gap-0";
      default: return "gap-4";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Badge 
        className={`mb-4 ${stage === "final" ? "bg-yellow-500 text-black" : ""}`}
      >
        <Trophy className="w-3 h-3 ml-1" />
        {STAGE_LABELS[stage]}
      </Badge>
      <div className={`flex flex-col ${getSpacing()} justify-center`}>
        {stageMatches
          .sort((a, b) => a.round - b.round)
          .map((match) => (
            <div key={match.id} className="flex items-center">
              <MatchCard match={match} />
              {!isLast && <BracketConnector direction="left" />}
            </div>
          ))}
      </div>
    </div>
  );
}

function BracketTree({ matches }: { matches: MatchWithTeams[] }) {
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

  const availableStages = STAGE_ORDER.filter(stage => 
    knockoutMatches.some(m => m.stage === stage)
  );

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-center justify-center gap-8 min-w-max p-4">
        {availableStages.map((stage, index) => (
          <div key={stage} className="flex items-center">
            <BracketStage 
              stage={stage} 
              matches={knockoutMatches} 
              isLast={index === availableStages.length - 1}
            />
            {index < availableStages.length - 1 && (
              <div className="w-8 flex items-center justify-center">
                <ChevronLeft className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
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
        <p className="text-3xl font-display font-bold text-yellow-700 dark:text-yellow-400">
          {winner.name}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Bracket() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

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
                <div className="p-4 text-center text-muted-foreground text-sm">
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
                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-t mt-1">
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
            {selectedTournament && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {selectedTournament.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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

            <TournamentWinner matches={matches} />
            
            <BracketTree matches={matches} />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">مفتاح الألوان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 rounded border"></div>
                    <span>الفائز</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted/50 rounded border"></div>
                    <span>الخاسر / لم تنتهِ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-100 text-red-700 text-[10px]">مباشر</Badge>
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
