import { Shield } from "lucide-react";
import { TeamNameDisplay } from "@/utils/teamNameUtils";

export interface TeamBoxProps {
  team?: { 
    id: string; 
    name: string; 
    logoUrl?: string | null; 
    primaryJersey?: string | null;
  };
  showLogo?: boolean;
  isWinner?: boolean;
  score?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function getTeamColor(team?: { name: string; primaryJersey?: string | null }): string {
  if (!team) return "#6b7280";
  
  if (team.primaryJersey) {
    const jersey = team.primaryJersey.toLowerCase();
    const colorMap: Record<string, string> = {
      "أحمر": "#dc2626", "red": "#dc2626",
      "أزرق": "#2563eb", "blue": "#2563eb",
      "أخضر": "#16a34a", "green": "#16a34a",
      "أصفر": "#eab308", "yellow": "#eab308",
      "برتقالي": "#ea580c", "orange": "#ea580c",
      "أسود": "#1f2937", "black": "#1f2937",
      "أبيض": "#f3f4f6", "white": "#f3f4f6",
      "بنفسجي": "#7c3aed", "purple": "#7c3aed",
      "وردي": "#ec4899", "pink": "#ec4899",
      "بني": "#92400e", "brown": "#92400e",
      "رمادي": "#6b7280", "gray": "#6b7280", "grey": "#6b7280",
      "ذهبي": "#d97706", "gold": "#d97706",
      "فضي": "#9ca3af", "silver": "#9ca3af",
      "سماوي": "#06b6d4", "cyan": "#06b6d4",
      "كحلي": "#1e3a5f", "navy": "#1e3a5f",
      "عنابي": "#7f1d1d", "maroon": "#7f1d1d",
    };
    
    if (jersey.startsWith("#") && (jersey.length === 4 || jersey.length === 7)) {
      return jersey;
    }
    
    for (const [key, value] of Object.entries(colorMap)) {
      if (jersey.includes(key)) return value;
    }
  }
  
  let hash = 0;
  const name = team.name;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    "#dc2626", "#ea580c", "#d97706", "#16a34a", 
    "#059669", "#0d9488", "#0891b2", "#2563eb", 
    "#4f46e5", "#7c3aed", "#a855f7", "#c026d3",
    "#db2777", "#e11d48"
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

export function isLightColor(hex: string): boolean {
  let color = hex.replace("#", "");
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  if (color.length !== 6) {
    return false;
  }
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export const TEAM_COLORS = [
  { name: "أحمر", value: "#dc2626" },
  { name: "أزرق", value: "#2563eb" },
  { name: "أخضر", value: "#16a34a" },
  { name: "أصفر", value: "#eab308" },
  { name: "برتقالي", value: "#ea580c" },
  { name: "أسود", value: "#1f2937" },
  { name: "أبيض", value: "#f3f4f6" },
  { name: "بنفسجي", value: "#7c3aed" },
  { name: "وردي", value: "#ec4899" },
  { name: "سماوي", value: "#06b6d4" },
  { name: "كحلي", value: "#1e3a5f" },
  { name: "عنابي", value: "#7f1d1d" },
  { name: "ذهبي", value: "#d97706" },
  { name: "فضي", value: "#9ca3af" },
];

export function TeamBox({ 
  team, 
  showLogo = true, 
  isWinner = false, 
  score,
  size = "md",
  className = ""
}: TeamBoxProps) {
  const bgColor = getTeamColor(team);
  const textColor = isLightColor(bgColor) ? "#1f2937" : "#ffffff";
  
  const sizeClasses = {
    sm: "px-2 py-1.5 min-h-[50px] w-full max-w-[140px]",
    md: "px-3 py-2 min-h-[60px] w-full max-w-[160px]",
    lg: "px-4 py-3 min-h-[70px] w-full max-w-[180px]"
  };
  
  const fontSizeClasses = {
    sm: "text-base leading-tight",
    md: "text-base leading-tight",
    lg: "text-base leading-tight"
  };
  
  const logoSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };
  
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  return (
    <div 
      className={`flex items-center gap-1.5 rounded-lg ${sizeClasses[size]} ${isWinner ? "ring-2 ring-yellow-400 ring-offset-1" : ""} ${className}`}
      style={{ backgroundColor: bgColor }}
      data-testid={`team-box-${team?.id}`}
    >
      {showLogo && (
        <div className={`${logoSizes[size]} rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden self-start mt-1`}>
          {team?.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
          ) : (
            <Shield className={iconSizes[size]} style={{ color: textColor }} />
          )}
        </div>
      )}
      <TeamNameDisplay 
        name={team?.name}
        className="font-bold flex-1 text-center"
        fontSizeClass={fontSizeClasses[size]}
        style={{ color: textColor, wordBreak: 'break-word', overflowWrap: 'break-word' }}
      />
      {score !== undefined && score !== null && (
        <span 
          className={`font-bold min-w-[20px] text-center flex-shrink-0 self-start ${fontSizeClasses[size]}`}
          style={{ color: textColor }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export function TeamColorPicker({ 
  value, 
  onChange,
  label = "لون الفريق"
}: { 
  value?: string | null; 
  onChange: (color: string) => void;
  label?: string;
}) {
  const currentColor = value || "";
  
  return (
    <div className="space-y-2">
      <label className="text-base font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {TEAM_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === color.value ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
            data-testid={`color-picker-${color.value}`}
          />
        ))}
      </div>
      <input
        type="color"
        value={currentColor.startsWith("#") ? currentColor : "#6b7280"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 rounded cursor-pointer"
        data-testid="color-picker-custom"
      />
    </div>
  );
}

export default TeamBox;
