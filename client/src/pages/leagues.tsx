import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  ChevronLeft,
  Flame,
  Target,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tournament } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const sportLabels: Record<string, string> = {
  football: "كرة القدم",
  basketball: "كرة السلة",
  volleyball: "الكرة الطائرة",
  tennis: "التنس",
};

const typeLabels: Record<string, string> = {
  round_robin: "دوري كامل",
  knockout: "خروج مغلوب",
  groups: "مجموعات + أدوار إقصائية",
};

const statusLabels: Record<string, string> = {
  registration: "التسجيل مفتوح",
  ongoing: "جارية",
  completed: "منتهية",
};

const statusColors: Record<string, string> = {
  registration: "bg-emerald-500 text-white",
  ongoing: "bg-orange-500 text-white",
  completed: "bg-gray-500 text-white",
};

const sportIcons: Record<string, string> = {
  football: "⚽",
  basketball: "🏀",
  volleyball: "🏐",
  tennis: "🎾",
};

export default function Leagues() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const filteredTournaments = tournaments?.filter(t => {
    if (activeTab === "all") return true;
    return t.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-20">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">البطولات والدوريات</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              استعرض جميع البطولات والدوريات الرياضية - سجّل فريقك وتنافس على البطولة
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
            <TabsTrigger value="all" data-testid="tab-all">الكل</TabsTrigger>
            <TabsTrigger value="registration" data-testid="tab-registration">التسجيل</TabsTrigger>
            <TabsTrigger value="ongoing" data-testid="tab-ongoing">جارية</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">منتهية</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-40 bg-muted" />
                <CardContent className="space-y-3 pt-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTournaments && filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate group" data-testid={`card-tournament-${tournament.id}`}>
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-8xl opacity-30">
                      {sportIcons[tournament.sport] || "🏆"}
                    </span>
                    <div className="absolute top-4 right-4">
                      <Badge className={statusColors[tournament.status]}>
                        {statusLabels[tournament.status]}
                      </Badge>
                    </div>
                    {tournament.status === "ongoing" && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500 text-white animate-pulse">
                          <Flame className="h-3 w-3 ml-1" />
                          مباشر
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-gold" />
                      {tournament.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tournament.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>{sportLabels[tournament.sport] || tournament.sport}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>{typeLabels[tournament.type] || tournament.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{tournament.maxTeams} فريق</span>
                      </div>
                      {tournament.startDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(tournament.startDate), "d MMM", { locale: ar })}</span>
                        </div>
                      )}
                    </div>

                    {tournament.venues && tournament.venues.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{tournament.venues.join("، ")}</span>
                      </div>
                    )}

                    <Link href={`/leagues/${tournament.id}`}>
                      <Button className="w-full group-hover:bg-primary" data-testid={`button-view-tournament-${tournament.id}`}>
                        عرض البطولة
                        <ChevronLeft className="h-4 w-4 mr-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Trophy className="h-20 w-20 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              لا توجد بطولات حالياً
            </h3>
            <p className="text-muted-foreground">
              {activeTab === "registration" && "لا توجد بطولات مفتوحة للتسجيل حالياً"}
              {activeTab === "ongoing" && "لا توجد بطولات جارية حالياً"}
              {activeTab === "completed" && "لا توجد بطولات منتهية"}
              {activeTab === "all" && "ترقب إعلان البطولات القادمة قريباً"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
