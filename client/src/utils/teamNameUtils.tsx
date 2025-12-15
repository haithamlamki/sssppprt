import React from "react";

// Get font size class based on team name length
export function getTeamNameFontSize(name: string | null | undefined): string {
  if (!name) return "text-[10px] md:text-xs";
  const length = name.length;
  if (length > 30) return "text-[8px] md:text-[9px]";
  if (length > 20) return "text-[9px] md:text-[10px]";
  return "text-[10px] md:text-xs";
}

// Split team name at the nearest word separator from the middle
export function splitTeamName(name: string | null | undefined): [string, string] | null {
  if (!name || name.length <= 20) return null;
  
  const midPoint = Math.floor(name.length / 2);
  const separators = [' ', '&', ',', '-', '/'];
  
  // Find the nearest separator to the middle
  let bestIndex = -1;
  let bestDistance = Infinity;
  
  for (let i = 0; i < name.length; i++) {
    if (separators.includes(name[i])) {
      const distance = Math.abs(i - midPoint);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
  }
  
  if (bestIndex === -1) {
    // No separator found, split at middle
    return [name.substring(0, midPoint), name.substring(midPoint)];
  }
  
  // Split at the separator (include separator in first part)
  return [name.substring(0, bestIndex + 1).trim(), name.substring(bestIndex + 1).trim()];
}

// Component to render team name with splitting for long names
export function TeamNameDisplay({ 
  name, 
  className = "",
  fontSizeClass,
  style
}: { 
  name: string | null | undefined; 
  className?: string;
  fontSizeClass?: string;
  style?: React.CSSProperties;
}) {
  const displayName = name || "فريق غير محدد";
  const split = splitTeamName(displayName);
  const fontSize = fontSizeClass || getTeamNameFontSize(displayName);
  
  if (split) {
    return (
      <div className={`${className} ${fontSize}`} style={style}>
        <div>{split[0]}</div>
        <div>{split[1]}</div>
      </div>
    );
  }
  
  return <span className={`${className} ${fontSize}`} style={style}>{displayName}</span>;
}
