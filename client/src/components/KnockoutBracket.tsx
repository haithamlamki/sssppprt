import { motion } from "framer-motion";
import { Link } from "wouter";
import { Trophy, Calendar, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchWithTeams, Tournament } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface KnockoutBracketProps {
  matches: MatchWithTeams[];
  tournament?: Tournament;
  groupStageComplete?: boolean;
}

const stageLabels: Record<string, string> = {
  round_of_16: "دور الـ 16",
  quarter_final: "ربع النهائي",
  semi_final: "نصف النهائي",
  final: "النهائي",
  third_place: "تحديد المركز الثالث",
};

const stageOrder = ["final", "semi_final", "quarter_final", "round_of_16"];

const matchStatusLabels: Record<string, string> = {
  scheduled: "قادمة",
  live: "مباشر",
  completed: "انتهت",
  postponed: "مؤجلة",
};

const matchStatusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  live: "bg-red-500 text-white animate-pulse",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  postponed: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

const groupLetterMap: Record<number, string> = {
  1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G", 8: "H"
};

function TeamRow({ 
  teamName, 
  score, 
  isWinner, 
  showScore,
  placeholder,
  flagUrl,
}: { 
  teamName?: string; 
  score?: number | null; 
  isWinner?: boolean;
  showScore?: boolean;
  placeholder?: string;
  flagUrl?: string;
}) {
  const displayName = teamName || placeholder || "TBD";
  const isTBD = !teamName;

  return (
    <div 
      className={`flex items-center justify-between px-3 py-2 border-b last:border-b-0 ${
        isWinner ? "bg-emerald-500/10" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {flagUrl && (
          <img src={flagUrl} alt="" className="w-5 h-4 object-cover rounded-sm" />
        )}
        <span className={`text-sm font-medium ${isTBD ? "text-muted-foreground italic" : ""} ${isWinner ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
          {displayName}
        </span>
      </div>
      <div className={`min-w-[24px] h-6 flex items-center justify-center rounded text-sm font-bold ${
        isWinner ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
      }`}>
        {showScore ? (score ?? 0) : "-"}
      </div>
    </div>
  );
}

function BracketMatchCard({ 
  match, 
  matchNumber,
  groupStageComplete = true,
  matchLabel,
}: { 
  match: MatchWithTeams; 
  matchNumber: number;
  groupStageComplete?: boolean;
  matchLabel?: string;
}) {
  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const showScores = isCompleted || isLive;
  
  const homeWon = isCompleted && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isCompleted && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  const homeTeamName = groupStageComplete ? match.homeTeam?.name : undefined;
  const awayTeamName = groupStageComplete ? match.awayTeam?.name : undefined;

  return (
    <Link href={`/matches/${match.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-card border rounded-lg overflow-hidden cursor-pointer hover-elevate w-full max-w-[280px]"
        data-testid={`bracket-match-${match.id}`}
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {matchNumber}
            </span>
            {matchLabel && (
              <span className="text-xs text-primary font-medium">
                {matchLabel}
              </span>
            )}
          </div>
          <Badge className={`text-[10px] px-1.5 py-0 ${matchStatusColors[match.status]}`}>
            {isLive && <Play className="h-2 w-2 ml-0.5" />}
            {matchStatusLabels[match.status]}
          </Badge>
        </div>

        <TeamRow 
          teamName={homeTeamName}
          score={match.homeScore}
          isWinner={homeWon}
          showScore={showScores}
          placeholder="TBD"
        />
        <TeamRow 
          teamName={awayTeamName}
          score={match.awayScore}
          isWinner={awayWon}
          showScore={showScores}
          placeholder="TBD"
        />

        <div className="flex items-center justify-center px-3 py-1.5 bg-muted/30 text-xs text-muted-foreground">
          {match.matchDate ? (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(match.matchDate), "d MMM", { locale: ar })}
            </div>
          ) : (
            <span>موعد غير محدد</span>
          )}
        </div>

        {(match.homePenaltyScore != null && match.awayPenaltyScore != null) && (
          <div className="px-3 py-1 text-xs text-orange-500 bg-orange-500/5 text-center">
            ركلات الترجيح: {match.homePenaltyScore} - {match.awayPenaltyScore}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

function StageSection({ 
  stage, 
  matches,
  groupStageComplete,
}: { 
  stage: string; 
  matches: MatchWithTeams[];
  groupStageComplete: boolean;
}) {
  const stageMatches = matches.filter(m => m.stage === stage);
  
  if (stageMatches.length === 0) return null;

  const isFinal = stage === "final";
  
  return (
    <div className="mb-8" data-testid={`stage-section-${stage}`}>
      <div className={`text-center mb-4 ${isFinal ? "" : ""}`}>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          isFinal 
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" 
            : "bg-muted"
        }`}>
          {isFinal && <Trophy className="h-4 w-4" />}
          <span className={`font-bold ${isFinal ? "text-base" : "text-sm"}`}>
            {stageLabels[stage]}
          </span>
          <span className="text-xs opacity-70">({stageMatches.length} مباراة)</span>
        </div>
      </div>
      
      <div className={`grid gap-4 ${
        stageMatches.length === 1 
          ? "grid-cols-1 max-w-[300px] mx-auto" 
          : stageMatches.length === 2 
            ? "grid-cols-1 md:grid-cols-2 max-w-[600px] mx-auto"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      }`}>
        {stageMatches.map((match, index) => (
          <div key={match.id} className="flex justify-center">
            <BracketMatchCard 
              match={match} 
              matchNumber={index + 1}
              groupStageComplete={groupStageComplete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function KnockoutBracket({ matches, tournament, groupStageComplete = true }: KnockoutBracketProps) {
  const knockoutMatches = matches.filter(m => m.stage && m.stage !== "group" && m.stage !== "league");
  
  if (knockoutMatches.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">لم تبدأ مرحلة خروج المغلوب بعد</p>
        <p className="text-sm mt-2">ستظهر شجرة التصفيات عند بدء الأدوار الإقصائية</p>
        {!groupStageComplete && (
          <p className="text-sm mt-4 text-orange-500">
            يجب إكمال مباريات المجموعات أولاً
          </p>
        )}
      </div>
    );
  }

  const availableStages = stageOrder.filter(stage => 
    knockoutMatches.some(m => m.stage === stage)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              شجرة خروج المغلوب
            </div>
            {!groupStageComplete && (
              <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                في انتظار نتائج المجموعات
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableStages.map((stage) => (
            <StageSection 
              key={stage} 
              stage={stage} 
              matches={knockoutMatches}
              groupStageComplete={groupStageComplete}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            قائمة مباريات خروج المغلوب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {knockoutMatches
              .sort((a, b) => {
                const stageIndexA = stageOrder.indexOf(a.stage || "");
                const stageIndexB = stageOrder.indexOf(b.stage || "");
                if (stageIndexA !== stageIndexB) return stageIndexB - stageIndexA;
                return (a.round || 0) - (b.round || 0);
              })
              .map((match, index) => (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <motion.div
                    whileHover={{ x: -4 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover-elevate"
                    data-testid={`list-match-${match.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {stageLabels[match.stage || ""] || match.stage}
                      </Badge>
                      <span className="font-medium">
                        {groupStageComplete 
                          ? `${match.homeTeam?.name || "TBD"} vs ${match.awayTeam?.name || "TBD"}`
                          : "TBD vs TBD"
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {match.status === "completed" && (
                        <span className="font-bold">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      )}
                      <Badge className={matchStatusColors[match.status]}>
                        {matchStatusLabels[match.status]}
                      </Badge>
                    </div>
                  </motion.div>
                </Link>
              ))}
          </div>
        </CardContent>
      </Card>

      {!groupStageComplete && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="py-4">
            <div className="text-center text-sm text-orange-600 dark:text-orange-400">
              <p className="font-medium mb-1">نظام التوزيع في خروج المغلوب</p>
              <p className="text-muted-foreground">
                الأول من المجموعة أ يواجه الثاني من المجموعة ب
                <br />
                الثاني من المجموعة أ يواجه الأول من المجموعة ب
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default KnockoutBracket;
