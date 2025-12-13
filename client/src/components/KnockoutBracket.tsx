import { motion } from "framer-motion";
import { Link } from "wouter";
import { Trophy, Calendar, MapPin, Play, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchWithTeams } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface KnockoutBracketProps {
  matches: MatchWithTeams[];
}

const isRTL = true;

const stageLabels: Record<string, string> = {
  round_of_16: "دور الـ 16",
  quarter_final: "ربع النهائي",
  semi_final: "نصف النهائي",
  final: "النهائي",
};

const stageOrder = ["round_of_16", "quarter_final", "semi_final", "final"];

const matchStatusLabels: Record<string, string> = {
  scheduled: "قادمة",
  live: "مباشر",
  completed: "انتهت",
  postponed: "مؤجلة",
};

const matchStatusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500",
  live: "bg-red-500 text-white animate-pulse",
  completed: "bg-emerald-500/10 text-emerald-500",
  postponed: "bg-yellow-500/10 text-yellow-500",
};

function BracketMatch({ match, isLast = false }: { match: MatchWithTeams; isLast?: boolean }) {
  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  
  const homeWon = isCompleted && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isCompleted && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <Link href={`/matches/${match.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative bg-card border rounded-lg overflow-hidden cursor-pointer hover-elevate min-w-[200px]"
        data-testid={`bracket-match-${match.id}`}
      >
        <div className="absolute top-2 right-2">
          <Badge className={`text-xs ${matchStatusColors[match.status]}`}>
            {isLive && <Play className="h-2 w-2 ml-1" />}
            {matchStatusLabels[match.status]}
          </Badge>
        </div>

        <div className="p-3 pt-8 space-y-1">
          <div className={`flex items-center justify-between p-2 rounded ${homeWon ? "bg-emerald-500/10" : ""}`}>
            <span className={`font-medium text-sm ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {match.homeTeam?.name || "TBD"}
            </span>
            <span className={`font-bold ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {isCompleted || isLive ? match.homeScore ?? 0 : "-"}
            </span>
          </div>
          
          <div className={`flex items-center justify-between p-2 rounded ${awayWon ? "bg-emerald-500/10" : ""}`}>
            <span className={`font-medium text-sm ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {match.awayTeam?.name || "TBD"}
            </span>
            <span className={`font-bold ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {isCompleted || isLive ? match.awayScore ?? 0 : "-"}
            </span>
          </div>
        </div>

        {match.matchDate && (
          <div className="px-3 pb-2 text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(match.matchDate), "d MMM", { locale: ar })}
          </div>
        )}

        {(match.homePenaltyScore != null && match.awayPenaltyScore != null) && (
          <div className="px-3 pb-2 text-xs text-orange-500">
            ركلات الترجيح: {match.homePenaltyScore} - {match.awayPenaltyScore}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

function StageColumn({ stage, matches }: { stage: string; matches: MatchWithTeams[] }) {
  const stageMatches = matches.filter(m => m.stage === stage);
  
  if (stageMatches.length === 0) return null;

  const isFinal = stage === "final";
  
  return (
    <div className="flex flex-col items-center gap-4" data-testid={`stage-${stage}`}>
      <div className={`text-center mb-2 ${isFinal ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full" : ""}`}>
        <h3 className={`font-bold ${isFinal ? "text-lg" : "text-sm"}`}>
          {isFinal && <Trophy className="h-4 w-4 inline-block ml-1" />}
          {stageLabels[stage]}
        </h3>
        <p className="text-xs opacity-70">{stageMatches.length} مباراة</p>
      </div>
      
      <div className="flex flex-col gap-6">
        {stageMatches.map((match, index) => (
          <BracketMatch 
            key={match.id} 
            match={match} 
            isLast={index === stageMatches.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export function KnockoutBracket({ matches }: KnockoutBracketProps) {
  const knockoutMatches = matches.filter(m => m.stage && m.stage !== "group");
  
  if (knockoutMatches.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>لم تبدأ مرحلة خروج المغلوب بعد</p>
        <p className="text-sm mt-2">ستظهر شجرة التصفيات عند بدء الأدوار الإقصائية</p>
      </div>
    );
  }

  const availableStages = stageOrder.filter(stage => 
    knockoutMatches.some(m => m.stage === stage)
  );
  
  const displayStages = isRTL ? [...availableStages].reverse() : availableStages;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            شجرة التصفيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start justify-center gap-8 min-w-max px-4">
              {displayStages.map((stage, index) => (
                <div key={stage} className="flex items-center">
                  <StageColumn stage={stage} matches={knockoutMatches} />
                  {index < displayStages.length - 1 && (
                    <div className="mx-4 flex items-center">
                      <ChevronRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
                return stageIndexA - stageIndexB;
              })
              .map((match) => (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <motion.div
                    whileHover={{ x: -4 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover-elevate"
                    data-testid={`list-match-${match.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {stageLabels[match.stage || ""] || match.stage}
                      </Badge>
                      <span className="font-medium">
                        {match.homeTeam?.name} vs {match.awayTeam?.name}
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
    </div>
  );
}

export default KnockoutBracket;
