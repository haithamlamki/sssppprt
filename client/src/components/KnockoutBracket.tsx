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
  third_place: "المركز الثالث",
};

// Get knockout stage match label like "نصف النهائي 1" or "ربع النهائي 2"
function getKnockoutMatchLabel(stage: string, matchIndex: number): string {
  const stageLabel = stageLabels[stage] || stage;
  if (stage === "final" || stage === "third_place") {
    return stageLabel;
  }
  return `${stageLabel} ${matchIndex + 1}`;
}

// Arabic group letters
const groupLetters: Record<number, string> = {
  1: "أ", 2: "ب", 3: "ج", 4: "د", 5: "هـ", 6: "و", 7: "ز", 8: "ح",
};

// Generate knockout pairing patterns dynamically based on number of groups
// Standard format: A1 vs B2, B1 vs A2, C1 vs D2, D1 vs C2, etc.
function generateKnockoutPairings(numGroups: number): { home: string; away: string }[] {
  const pairings: { home: string; away: string }[] = [];
  
  // Pair groups in twos: (A,B), (C,D), (E,F), etc.
  for (let i = 0; i < numGroups; i += 2) {
    const groupA = i + 1;
    const groupB = i + 2;
    
    if (groupB <= numGroups) {
      // A1 vs B2
      pairings.push({
        home: `${groupLetters[groupA] || groupA}1`,
        away: `${groupLetters[groupB] || groupB}2`
      });
      // B1 vs A2
      pairings.push({
        home: `${groupLetters[groupB] || groupB}1`,
        away: `${groupLetters[groupA] || groupA}2`
      });
    }
  }
  
  return pairings;
}

// Get position label like "أ1" (A1) or "ب2" (B2)
// Dynamically generates labels based on stage and match index
function getPositionLabel(matchIndex: number, isHome: boolean, stage: string, numGroups: number = 2): string {
  // For final - winners from semi-finals
  if (stage === "final") {
    return isHome ? "فائز 1" : "فائز 2";
  }
  
  // For third place match
  if (stage === "third_place") {
    return isHome ? "خاسر 1" : "خاسر 2";
  }
  
  // For knockout stages (semi_final, quarter_final, round_of_16)
  // Generate pairings dynamically based on number of groups
  const pairings = generateKnockoutPairings(numGroups);
  
  if (matchIndex < pairings.length) {
    return isHome ? pairings[matchIndex].home : pairings[matchIndex].away;
  }
  
  // Fallback for matches beyond generated pairings
  // This handles cases where there are more matches than groups can generate
  const fallbackGroup = Math.floor(matchIndex / 2) * 2 + 1;
  const isFirstInPair = matchIndex % 2 === 0;
  if (isFirstInPair) {
    return isHome 
      ? `${groupLetters[fallbackGroup] || fallbackGroup}1` 
      : `${groupLetters[fallbackGroup + 1] || (fallbackGroup + 1)}2`;
  } else {
    return isHome 
      ? `${groupLetters[fallbackGroup + 1] || (fallbackGroup + 1)}1` 
      : `${groupLetters[fallbackGroup] || fallbackGroup}2`;
  }
}

const stageOrder = ["round_of_16", "quarter_final", "semi_final", "final"];

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

function CompactMatchCard({ 
  match, 
  groupStageComplete = true,
  isRightSide = false,
  matchIndex = 0,
  numGroups = 2,
}: { 
  match: MatchWithTeams; 
  groupStageComplete?: boolean;
  isRightSide?: boolean;
  matchIndex?: number;
  numGroups?: number;
}) {
  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const showScores = isCompleted || isLive;
  
  const homeWon = isCompleted && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isCompleted && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  const homeTeamName = groupStageComplete 
    ? (match.homeTeam?.name || "TBD") 
    : getPositionLabel(matchIndex, true, match.stage || "semi_final", numGroups);
  const awayTeamName = groupStageComplete 
    ? (match.awayTeam?.name || "TBD") 
    : getPositionLabel(matchIndex, false, match.stage || "semi_final", numGroups);

  const getShortName = (name: string) => {
    if (name === "TBD") return "TBD";
    const words = name.split(/[\s&]+/).filter(w => w.length > 0);
    if (words.length >= 2) {
      return words.slice(0, 2).map(w => w.substring(0, 3).toUpperCase()).join(" ");
    }
    return name.substring(0, 6).toUpperCase();
  };

  return (
    <Link href={`/matches/${match.id}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="bg-card border-2 border-primary/20 rounded-lg overflow-hidden cursor-pointer hover-elevate w-[140px] shadow-md"
        data-testid={`bracket-match-${match.id}`}
      >
        <div className={`flex items-center justify-between px-2 py-1 ${homeWon ? "bg-emerald-500/20" : "bg-muted/50"}`}>
          <span className={`text-xs font-bold truncate flex-1 ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""} ${!groupStageComplete ? "text-muted-foreground italic" : ""}`}>
            {getShortName(homeTeamName)}
          </span>
          <span className={`text-xs font-bold min-w-[20px] text-center rounded px-1 ${homeWon ? "bg-emerald-500 text-white" : "bg-muted"}`}>
            {showScores ? (match.homeScore ?? 0) : "-"}
          </span>
        </div>

        <div className={`flex items-center justify-between px-2 py-1 ${awayWon ? "bg-emerald-500/20" : "bg-muted/50"}`}>
          <span className={`text-xs font-bold truncate flex-1 ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""} ${!groupStageComplete ? "text-muted-foreground italic" : ""}`}>
            {getShortName(awayTeamName)}
          </span>
          <span className={`text-xs font-bold min-w-[20px] text-center rounded px-1 ${awayWon ? "bg-emerald-500 text-white" : "bg-muted"}`}>
            {showScores ? (match.awayScore ?? 0) : "-"}
          </span>
        </div>

        <div className="flex items-center justify-center px-1 py-0.5 bg-primary/5 text-[10px] text-muted-foreground">
          {match.matchDate ? (
            format(new Date(match.matchDate), "dd/MM/yyyy HH:mm", { locale: ar })
          ) : (
            "موعد غير محدد"
          )}
        </div>
      </motion.div>
    </Link>
  );
}

function HorizontalBracket({ 
  matches, 
  groupStageComplete,
  trophyImageUrl,
}: { 
  matches: MatchWithTeams[];
  groupStageComplete: boolean;
  trophyImageUrl?: string;
}) {
  const round16 = matches.filter(m => m.stage === "round_of_16").sort((a, b) => (a.round || 0) - (b.round || 0));
  const quarterFinals = matches.filter(m => m.stage === "quarter_final").sort((a, b) => (a.round || 0) - (b.round || 0));
  const semiFinals = matches.filter(m => m.stage === "semi_final").sort((a, b) => (a.round || 0) - (b.round || 0));
  const final = matches.find(m => m.stage === "final");
  const thirdPlace = matches.find(m => m.stage === "third_place");

  const leftR16 = round16.slice(0, 4);
  const rightR16 = round16.slice(4, 8);
  const leftQF = quarterFinals.slice(0, 2);
  const rightQF = quarterFinals.slice(2, 4);
  const leftSF = semiFinals.slice(0, 1);
  const rightSF = semiFinals.slice(1, 2);

  const hasR16 = round16.length > 0;
  const hasQF = quarterFinals.length > 0;
  const hasSF = semiFinals.length > 0;
  const hasFinal = !!final;

  return (
    <div className="relative overflow-x-auto pb-4">
      <div className="min-w-[900px] relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
            <Trophy className="h-5 w-5" />
            النهائي
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col gap-4">
            {hasR16 && (
              <div className="flex flex-col gap-8">
                <div className="text-center text-xs font-medium text-muted-foreground mb-2">دور الـ 16</div>
                {leftR16.map((match, i) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} matchIndex={i} />
                    <div className="absolute top-1/2 -left-4 w-4 h-px bg-primary/30" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasQF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-20">
                <div className="text-center text-xs font-medium text-muted-foreground mb-2">ربع النهائي</div>
                {leftQF.map((match, i) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} matchIndex={i} />
                    <div className="absolute top-1/2 -left-4 w-4 h-px bg-primary/30" />
                    <div className="absolute top-1/2 -right-4 w-4 h-px bg-primary/30" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-32">
                <div className="text-center text-xs font-medium text-muted-foreground mb-2">نصف النهائي</div>
                {leftSF.map((match) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} matchIndex={0} />
                    <div className="absolute top-1/2 -left-4 w-4 h-px bg-primary/30" />
                    <div className="absolute top-1/2 -right-4 w-4 h-px bg-primary/30" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 mx-8">
            {trophyImageUrl ? (
              <img 
                src={trophyImageUrl} 
                alt="كأس البطولة" 
                className="w-32 h-40 object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="w-32 h-40 flex items-center justify-center">
                <Trophy className="w-24 h-24 text-yellow-500 drop-shadow-lg" />
              </div>
            )}
            
            {hasFinal && final && (
              <div className="mt-4">
                <CompactMatchCard match={final} groupStageComplete={groupStageComplete} matchIndex={0} />
              </div>
            )}

            {thirdPlace && (
              <div className="mt-4">
                <div className="text-center text-xs font-medium text-muted-foreground mb-2">المركز الثالث</div>
                <CompactMatchCard match={thirdPlace} groupStageComplete={groupStageComplete} matchIndex={0} />
              </div>
            )}
          </div>

          {hasSF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-32">
                <div className="text-center text-xs font-medium text-muted-foreground mb-2">نصف النهائي</div>
                {rightSF.map((match) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} isRightSide matchIndex={1} />
                    <div className="absolute top-1/2 -left-4 w-4 h-px bg-primary/30" />
                    <div className="absolute top-1/2 -right-4 w-4 h-px bg-primary/30" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasQF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-20">
                <div className="text-center text-xs font-medium text-muted-foreground mb-2">ربع النهائي</div>
                {rightQF.map((match, i) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} isRightSide matchIndex={i + 2} />
                    <div className="absolute top-1/2 -left-4 w-4 h-px bg-primary/30" />
                    <div className="absolute top-1/2 -right-4 w-4 h-px bg-primary/30" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {hasR16 && (
              <div className="flex flex-col gap-8">
                <div className="text-center text-xs font-medium text-muted-foreground mb-2">دور الـ 16</div>
                {rightR16.map((match, i) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} isRightSide matchIndex={i + 4} />
                    <div className="absolute top-1/2 -right-4 w-4 h-px bg-primary/30" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleBracket({ 
  matches, 
  groupStageComplete,
  trophyImageUrl,
}: { 
  matches: MatchWithTeams[];
  groupStageComplete: boolean;
  trophyImageUrl?: string;
}) {
  const semiFinals = matches.filter(m => m.stage === "semi_final").sort((a, b) => (a.round || 0) - (b.round || 0));
  const final = matches.find(m => m.stage === "final");
  const thirdPlace = matches.find(m => m.stage === "third_place");

  const leftSF = semiFinals[0];
  const rightSF = semiFinals[1];

  return (
    <div className="flex items-stretch justify-center gap-2 md:gap-4 py-8 overflow-x-auto">
      <div className="flex flex-col justify-center">
        {leftSF && (
          <div className="relative">
            <div className="text-center text-xs font-medium text-muted-foreground mb-2">نصف النهائي</div>
            <CompactMatchCard match={leftSF} groupStageComplete={groupStageComplete} matchIndex={0} />
            <div className="absolute top-1/2 -left-2 md:-left-4 w-2 md:w-4 h-px bg-primary/40" />
          </div>
        )}
      </div>

      <div className="flex items-center">
        <div className="w-8 md:w-16 h-px bg-primary/40" />
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        {trophyImageUrl ? (
          <img 
            src={trophyImageUrl} 
            alt="كأس البطولة" 
            className="w-20 h-28 md:w-28 md:h-36 object-contain drop-shadow-2xl"
          />
        ) : (
          <div className="w-20 h-28 md:w-28 md:h-36 flex items-center justify-center bg-gradient-to-b from-yellow-400/20 to-orange-400/20 rounded-lg">
            <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 drop-shadow-lg" />
          </div>
        )}
        
        {final ? (
          <div>
            <div className="text-center text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-2">النهائي</div>
            <CompactMatchCard match={final} groupStageComplete={groupStageComplete} matchIndex={0} />
          </div>
        ) : (
          <div>
            <div className="text-center text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-2">النهائي</div>
            <div className="bg-card border-2 border-dashed border-yellow-500/40 rounded-lg w-[140px] shadow-md">
              <div className="flex items-center justify-between px-2 py-1 bg-muted/30">
                <span className="text-xs font-bold text-muted-foreground italic">فائز 1</span>
                <span className="text-xs font-bold min-w-[20px] text-center rounded px-1 bg-muted">-</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-muted/30">
                <span className="text-xs font-bold text-muted-foreground italic">فائز 2</span>
                <span className="text-xs font-bold min-w-[20px] text-center rounded px-1 bg-muted">-</span>
              </div>
              <div className="flex items-center justify-center px-1 py-0.5 bg-primary/5 text-[10px] text-muted-foreground">
                موعد غير محدد
              </div>
            </div>
          </div>
        )}

        {thirdPlace && (
          <div className="mt-2">
            <div className="text-center text-[10px] font-medium text-muted-foreground mb-1">المركز الثالث</div>
            <CompactMatchCard match={thirdPlace} groupStageComplete={groupStageComplete} matchIndex={0} />
          </div>
        )}
      </div>

      <div className="flex items-center">
        <div className="w-8 md:w-16 h-px bg-primary/40" />
      </div>

      <div className="flex flex-col justify-center">
        {rightSF && (
          <div className="relative">
            <div className="text-center text-xs font-medium text-muted-foreground mb-2">نصف النهائي</div>
            <CompactMatchCard match={rightSF} groupStageComplete={groupStageComplete} isRightSide matchIndex={1} />
            <div className="absolute top-1/2 -right-2 md:-right-4 w-2 md:w-4 h-px bg-primary/40" />
          </div>
        )}
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

  const hasR16 = knockoutMatches.some(m => m.stage === "round_of_16");
  const hasQF = knockoutMatches.some(m => m.stage === "quarter_final");
  const trophyImageUrl = tournament?.trophyImageUrl ?? undefined;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-b from-blue-950/50 to-blue-900/30 dark:from-blue-950/80 dark:to-blue-900/50 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Trophy className="h-5 w-5 text-yellow-400" />
              شجرة خروج المغلوب
            </div>
            {!groupStageComplete && (
              <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-500/10">
                في انتظار نتائج المجموعات
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(hasR16 || hasQF) ? (
            <HorizontalBracket 
              matches={knockoutMatches} 
              groupStageComplete={groupStageComplete}
              trophyImageUrl={trophyImageUrl}
            />
          ) : (
            <SimpleBracket 
              matches={knockoutMatches} 
              groupStageComplete={groupStageComplete}
              trophyImageUrl={trophyImageUrl}
            />
          )}
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
                if (stageIndexA !== stageIndexB) return stageIndexA - stageIndexB;
                return (a.round || 0) - (b.round || 0);
              })
              .map((match, index) => {
                const stageMatches = knockoutMatches.filter(m => m.stage === match.stage);
                const matchIndex = stageMatches.findIndex(m => m.id === match.id);
                const homeLabel = getPositionLabel(matchIndex, true, match.stage || "semi_final");
                const awayLabel = getPositionLabel(matchIndex, false, match.stage || "semi_final");
                
                return (
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
                          {getKnockoutMatchLabel(match.stage || "", matchIndex)}
                        </Badge>
                        <span className="font-medium">
                          {groupStageComplete 
                            ? `${match.homeTeam?.name || "TBD"} × ${match.awayTeam?.name || "TBD"}`
                            : `(${homeLabel}) × (${awayLabel})`
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
                );
              })}
          </div>
        </CardContent>
      </Card>

      {!groupStageComplete && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="py-4">
            <div className="text-center text-sm text-orange-600 dark:text-orange-400">
              <p className="font-medium mb-1">نظام التوزيع في خروج المغلوب</p>
              <p className="text-muted-foreground">
                الأول يواجه الثاني، الثالث يواجه الرابع، وهكذا
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default KnockoutBracket;
