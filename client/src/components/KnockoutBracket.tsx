import { motion } from "framer-motion";
import { Link } from "wouter";
import { Trophy, Calendar, Play, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchWithTeams, Tournament } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import stadiumBackground from "@assets/stadium-background.png";

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

/**
 * Get intelligent source text from team source reference
 * Converts "WINNER_OF:match_id" or "LOSER_OF:match_id" to readable Arabic text
 * For group stage matches, shows position labels like "أ1" or "ب2"
 */
function getIntelligentSourceText(
  source: string | null | undefined,
  allMatches: MatchWithTeams[],
  matchIndex?: number,
  numGroups?: number,
  isHome?: boolean
): string {
  if (!source) return "";
  
  // Handle SEED references
  if (source.startsWith("SEED:")) {
    const seedNum = parseInt(source.split(":")[1]);
    return `البذرة ${seedNum}`;
  }
  
  // Handle WINNER_OF and LOSER_OF references
  const [sourceType, sourceMatchId] = source.split(":");
  if (!sourceMatchId) return "";
  
  const sourceMatch = allMatches.find(m => m.id === sourceMatchId);
  if (!sourceMatch) return "";
  
  // إذا كانت المباراة المصدر من مرحلة المجموعات، استخدم التسمية البسيطة (أ1، ب2)
  if (sourceMatch.stage === "group") {
    const groupNum = sourceMatch.groupNumber || 1;
    const position = sourceType === "WINNER_OF" ? 1 : 2;
    return `${groupLetters[groupNum] || groupNum}${position}`;
  }
  
  // للمباريات الأخرى، استخدم النص الوصفي
  const stageLabel = stageLabels[sourceMatch.stage || ""] || sourceMatch.stage || "";
  const matchLabel = getKnockoutMatchLabel(sourceMatch.stage || "", sourceMatch.bracketPosition || sourceMatch.round || 0);
  
  if (sourceType === "WINNER_OF") {
    return `الفائز من ${matchLabel}`;
  } else if (sourceType === "LOSER_OF") {
    return `الخاسر من ${matchLabel}`;
  }
  
  return "";
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
    return isHome ? "فائز نصف النهائي 1" : "فائز نصف النهائي 2";
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
  allMatches = [],
  isThirdPlace = false,
}: { 
  match: MatchWithTeams; 
  groupStageComplete?: boolean;
  isRightSide?: boolean;
  matchIndex?: number;
  numGroups?: number;
  allMatches?: MatchWithTeams[];
  isThirdPlace?: boolean;
}) {
  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const isScheduled = match.status === "scheduled";
  const showScores = isCompleted || isLive;
  
  const homeWon = isCompleted && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isCompleted && (match.awayScore ?? 0) > (match.homeScore ?? 0);
  
  // Show penalty scores if match went to penalties
  const showPenalties = isCompleted && (match as any).wentToPenalties && 
    (match as any).homePenaltyScore !== null && (match as any).awayPenaltyScore !== null;

  // Get intelligent team names - prefer actual team, then source text, then position label
  let homeTeamName: string;
  if (match.homeTeam?.name) {
    homeTeamName = match.homeTeam.name;
  } else if ((match as any).homeTeamSource) {
    const sourceText = getIntelligentSourceText((match as any).homeTeamSource, allMatches, matchIndex, numGroups, true);
    if (sourceText) {
      homeTeamName = sourceText;
    } else {
      // إذا لم نجد نص ذكي، استخدم التسمية حسب الموضع (أ1، ب2، إلخ)
      homeTeamName = getPositionLabel(matchIndex, true, match.stage || "semi_final", numGroups);
    }
  } else {
    // استخدم التسمية حسب الموضع لإظهار التوزيع الصحيح (أ1 vs ب2)
    homeTeamName = getPositionLabel(matchIndex, true, match.stage || "semi_final", numGroups);
  }

  let awayTeamName: string;
  if (match.awayTeam?.name) {
    awayTeamName = match.awayTeam.name;
  } else if ((match as any).awayTeamSource) {
    const sourceText = getIntelligentSourceText((match as any).awayTeamSource, allMatches, matchIndex, numGroups, false);
    if (sourceText) {
      awayTeamName = sourceText;
    } else {
      // إذا لم نجد نص ذكي، استخدم التسمية حسب الموضع (أ1، ب2، إلخ)
      awayTeamName = getPositionLabel(matchIndex, false, match.stage || "semi_final", numGroups);
    }
  } else {
    // استخدم التسمية حسب الموضع لإظهار التوزيع الصحيح (أ1 vs ب2)
    awayTeamName = getPositionLabel(matchIndex, false, match.stage || "semi_final", numGroups);
  }

  // إرجاع النص الكامل بدون تقطيع
  const getDisplayName = (name: string) => {
    return name;
  };

  // تحديد لون البطاقة حسب الحالة
  const getCardBorderColor = () => {
    if (isLive) return "border-red-500";
    if (isCompleted) return "border-emerald-500";
    if (isScheduled) return "border-blue-500";
    return "border-primary/20";
  };

  const getCardBgColor = () => {
    if (isLive) return "bg-red-500/5";
    if (isCompleted) return "bg-emerald-500/5";
    if (isScheduled) return "bg-blue-500/5";
    return "bg-card";
  };

  // تصغير المركز الثالث بصرياً
  const cardClasses = isThirdPlace 
    ? `bg-card border-2 ${getCardBorderColor()} rounded-lg overflow-hidden cursor-pointer hover-elevate w-[180px] sm:w-[200px] shadow-sm opacity-75`
    : `bg-card border-2 ${getCardBorderColor()} rounded-lg overflow-hidden cursor-pointer hover-elevate w-[180px] sm:w-[200px] shadow-md`;

  return (
    <Link href={`/matches/${match.id}`}>
      <motion.div
        whileHover={{ scale: isThirdPlace ? 1.02 : 1.03 }}
        className={cardClasses}
        data-testid={`bracket-match-${match.id}`}
      >
        <div className={`flex flex-col items-center justify-center ${isThirdPlace ? "px-1.5 py-1.5" : "px-2 py-2"} ${homeWon ? "bg-emerald-500/20" : "bg-muted/50"}`}>
          <span className={`${isThirdPlace ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"} font-bold text-center break-words w-full ${homeWon ? "text-emerald-600 dark:text-emerald-400" : ""} ${!groupStageComplete && !match.homeTeam ? "text-muted-foreground italic" : ""}`}>
            {getDisplayName(homeTeamName)}
          </span>
          <span className={`${isThirdPlace ? "text-sm sm:text-base" : "text-base sm:text-lg"} font-bold min-w-[20px] sm:min-w-[24px] text-center rounded ${isThirdPlace ? "px-1" : "px-1.5"} mt-1 ${homeWon ? "bg-emerald-500 text-white" : "bg-muted"}`}>
            {showScores ? (match.homeScore ?? 0) : "-"}
          </span>
        </div>

        <div className={`flex flex-col items-center justify-center ${isThirdPlace ? "px-1.5 py-1.5" : "px-2 py-2"} ${awayWon ? "bg-emerald-500/20" : "bg-muted/50"}`}>
          <span className={`${isThirdPlace ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"} font-bold text-center break-words w-full ${awayWon ? "text-emerald-600 dark:text-emerald-400" : ""} ${!groupStageComplete && !match.awayTeam ? "text-muted-foreground italic" : ""}`}>
            {getDisplayName(awayTeamName)}
          </span>
          <span className={`${isThirdPlace ? "text-sm sm:text-base" : "text-base sm:text-lg"} font-bold min-w-[20px] sm:min-w-[24px] text-center rounded ${isThirdPlace ? "px-1" : "px-1.5"} mt-1 ${awayWon ? "bg-emerald-500 text-white" : "bg-muted"}`}>
            {showScores ? (match.awayScore ?? 0) : "-"}
          </span>
        </div>

        {/* معلومات التاريخ والوقت والملعب */}
        <div className={`${isThirdPlace ? "px-1.5 py-1" : "px-2 py-1.5"} ${getCardBgColor()} border-t border-border/50`}>
          {match.matchDate ? (
            <div className={`flex items-center gap-0.5 sm:gap-1 ${isThirdPlace ? "text-[9px]" : "text-[10px] sm:text-xs"} text-muted-foreground mb-0.5 sm:mb-1`}>
              <Calendar className={`${isThirdPlace ? "h-2.5 w-2.5" : "h-3 w-3"} flex-shrink-0`} />
              <span>{format(new Date(match.matchDate), "dd/MM/yyyy", { locale: ar })}</span>
            </div>
          ) : null}
          {match.matchDate ? (
            <div className={`flex items-center gap-0.5 sm:gap-1 ${isThirdPlace ? "text-[9px]" : "text-[10px] sm:text-xs"} text-muted-foreground mb-0.5 sm:mb-1`}>
              <Clock className={`${isThirdPlace ? "h-2.5 w-2.5" : "h-3 w-3"} flex-shrink-0`} />
              <span dir="ltr">{format(new Date(match.matchDate), "HH:mm", { locale: ar })}</span>
            </div>
          ) : null}
          {match.venue ? (
            <div className={`flex items-center gap-0.5 sm:gap-1 ${isThirdPlace ? "text-[9px]" : "text-[10px] sm:text-xs"} text-muted-foreground`}>
              <MapPin className={`${isThirdPlace ? "h-2.5 w-2.5" : "h-3 w-3"} flex-shrink-0`} />
              <span className="truncate">{match.venue}</span>
            </div>
          ) : null}
          {!match.matchDate && !match.venue && (
            <span className={`${isThirdPlace ? "text-[9px]" : "text-[10px]"} text-muted-foreground`}>موعد غير محدد</span>
          )}
          {showPenalties && (
            <div className={`mt-0.5 sm:mt-1 ${isThirdPlace ? "text-[9px]" : "text-[10px]"} font-bold text-primary`}>
              ترجيح: {(match as any).homePenaltyScore}-{(match as any).awayPenaltyScore}
            </div>
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
  numGroups = 2,
}: { 
  matches: MatchWithTeams[];
  groupStageComplete: boolean;
  trophyImageUrl?: string;
  numGroups?: number;
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
                <div className="text-center text-base font-medium text-muted-foreground mb-2">دور الـ 16</div>
                {leftR16.map((match, i) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} matchIndex={i} numGroups={numGroups} allMatches={matches} />
                    <div className="absolute top-1/2 -left-4 w-4 h-1 bg-yellow-500/60" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasQF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-20">
                <div className="text-center text-base font-medium text-muted-foreground mb-2">ربع النهائي</div>
                {leftQF.map((match, i) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} matchIndex={i} numGroups={numGroups} allMatches={matches} />
                    <div className="absolute top-1/2 -left-4 w-4 h-1 bg-yellow-500/60" />
                    <div className="absolute top-1/2 -right-4 w-4 h-1 bg-yellow-500/60" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-32">
                <div className="text-center text-base font-medium text-muted-foreground mb-2">نصف النهائي</div>
                {leftSF.map((match) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} matchIndex={0} numGroups={numGroups} allMatches={matches} />
                    <div className="absolute top-1/2 -left-4 w-4 h-1 bg-yellow-500/60" />
                    <div className="absolute top-1/2 -right-4 w-4 h-1 bg-yellow-500/60" />
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
                <CompactMatchCard match={final} groupStageComplete={groupStageComplete} matchIndex={0} numGroups={numGroups} allMatches={matches} />
              </div>
            )}

            {thirdPlace && (
              <div className="mt-4">
                <div className="text-center text-sm font-medium text-muted-foreground mb-1 opacity-75">المركز الثالث</div>
                <CompactMatchCard match={thirdPlace} groupStageComplete={groupStageComplete} matchIndex={0} numGroups={numGroups} allMatches={matches} isThirdPlace={true} />
              </div>
            )}
          </div>

          {hasSF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-32">
                <div className="text-center text-base font-medium text-muted-foreground mb-2">نصف النهائي</div>
                {rightSF.map((match) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} isRightSide matchIndex={1} numGroups={numGroups} allMatches={matches} />
                    <div className="absolute top-1/2 -left-4 w-4 h-1 bg-yellow-500/60" />
                    <div className="absolute top-1/2 -right-4 w-4 h-1 bg-yellow-500/60" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasQF && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-20">
                <div className="text-center text-base font-medium text-muted-foreground mb-2">ربع النهائي</div>
                {rightQF.map((match, i) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} isRightSide matchIndex={i + 2} numGroups={numGroups} allMatches={matches} />
                    <div className="absolute top-1/2 -left-4 w-4 h-1 bg-yellow-500/60" />
                    <div className="absolute top-1/2 -right-4 w-4 h-1 bg-yellow-500/60" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {hasR16 && (
              <div className="flex flex-col gap-8">
                <div className="text-center text-base font-medium text-muted-foreground mb-2">دور الـ 16</div>
                {rightR16.map((match, i) => (
                  <div key={match.id} className="relative">
                    <CompactMatchCard match={match} groupStageComplete={groupStageComplete} isRightSide matchIndex={i + 4} numGroups={numGroups} allMatches={matches} />
                    <div className="absolute top-1/2 -right-4 w-4 h-1 bg-yellow-500/60" />
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
  numGroups = 2,
}: { 
  matches: MatchWithTeams[];
  groupStageComplete: boolean;
  trophyImageUrl?: string;
  numGroups?: number;
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
            <div className="text-center text-base font-medium text-muted-foreground mb-2">نصف النهائي</div>
            <CompactMatchCard match={leftSF} groupStageComplete={groupStageComplete} matchIndex={0} numGroups={numGroups} allMatches={matches} />
            <div className="absolute top-1/2 -left-2 md:-left-4 w-2 md:w-4 h-1 bg-yellow-500/70" />
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
            <div className="text-center text-base font-medium text-yellow-600 dark:text-yellow-400 mb-2">النهائي</div>
            <CompactMatchCard match={final} groupStageComplete={groupStageComplete} matchIndex={0} numGroups={numGroups} allMatches={matches} />
          </div>
        ) : (
          <div>
            <div className="text-center text-base font-medium text-yellow-600 dark:text-yellow-400 mb-2">النهائي</div>
            <div className="bg-card border-2 border-dashed border-yellow-500/40 rounded-lg w-[180px] sm:w-[200px] shadow-md">
              <div className="flex flex-col items-center justify-center px-2 py-2 bg-muted/30">
                <span className="text-xs sm:text-sm font-bold text-center break-words w-full text-muted-foreground italic">فائز نصف النهائي 1</span>
                <span className="text-base sm:text-lg font-bold min-w-[24px] text-center rounded px-1.5 mt-1 bg-muted">-</span>
              </div>
              <div className="flex flex-col items-center justify-center px-2 py-2 bg-muted/30">
                <span className="text-xs sm:text-sm font-bold text-center break-words w-full text-muted-foreground italic">فائز نصف النهائي 2</span>
                <span className="text-base sm:text-lg font-bold min-w-[24px] text-center rounded px-1.5 mt-1 bg-muted">-</span>
              </div>
              <div className="flex items-center justify-center px-1 py-0.5 bg-primary/5 text-base text-muted-foreground">
                موعد غير محدد
              </div>
            </div>
          </div>
        )}

        {thirdPlace && (
          <div className="mt-2">
            <div className="text-center text-sm font-medium text-muted-foreground mb-1 opacity-75">المركز الثالث</div>
                <CompactMatchCard match={thirdPlace} groupStageComplete={groupStageComplete} matchIndex={0} numGroups={numGroups} allMatches={matches} isThirdPlace={true} />
          </div>
        )}
      </div>

      <div className="flex items-center">
        <div className="w-8 md:w-16 h-px bg-primary/40" />
      </div>

      <div className="flex flex-col justify-center">
        {rightSF && (
          <div className="relative">
            <div className="text-center text-base font-medium text-muted-foreground mb-2">نصف النهائي</div>
            <CompactMatchCard match={rightSF} groupStageComplete={groupStageComplete} isRightSide matchIndex={1} numGroups={numGroups} allMatches={matches} />
            <div className="absolute top-1/2 -right-2 md:-right-4 w-2 md:w-4 h-1 bg-yellow-500/70" />
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
        <p className="text-base mt-2">ستظهر شجرة التصفيات عند بدء الأدوار الإقصائية</p>
        {!groupStageComplete && (
          <p className="text-base mt-4 text-orange-500">
            يجب إكمال مباريات المجموعات أولاً
          </p>
        )}
      </div>
    );
  }

  const hasR16 = knockoutMatches.some(m => m.stage === "round_of_16");
  const hasQF = knockoutMatches.some(m => m.stage === "quarter_final");
  const trophyImageUrl = tournament?.trophyImageUrl ?? undefined;
  const numGroups = tournament?.numberOfGroups || 2;

  return (
    <div className="space-y-6">
      <Card className="relative border-blue-500/20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20"
          style={{ backgroundImage: `url(${stadiumBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 to-blue-900/50 dark:from-blue-950/80 dark:to-blue-900/60" />
        {!groupStageComplete && (
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center justify-end">
              <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-500/10">
                في انتظار نتائج المجموعات
              </Badge>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="relative z-10">
          {(hasR16 || hasQF) ? (
            <HorizontalBracket 
              matches={knockoutMatches} 
              groupStageComplete={groupStageComplete}
              trophyImageUrl={trophyImageUrl}
              numGroups={numGroups}
            />
          ) : (
            <SimpleBracket 
              matches={knockoutMatches} 
              groupStageComplete={groupStageComplete}
              trophyImageUrl={trophyImageUrl}
              numGroups={numGroups}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
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
                const homeLabel = getPositionLabel(matchIndex, true, match.stage || "semi_final", numGroups);
                const awayLabel = getPositionLabel(matchIndex, false, match.stage || "semi_final", numGroups);
                
                return (
                  <Link key={match.id} href={`/matches/${match.id}`}>
                    <motion.div
                      whileHover={{ x: -4 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover-elevate"
                      data-testid={`list-match-${match.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full text-base font-bold text-primary">
                          {index + 1}
                        </span>
                        <Badge variant="outline" className="text-sm">
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
            <div className="text-center text-base text-orange-600 dark:text-orange-400">
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
