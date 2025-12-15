import { Trophy, Medal, Award, Crown, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import awardsImage from "@assets/generated_images/Championship_awards_display_421aecd4.png";

export default function Results() {
  const tournaments = [
    {
      id: 1,
      name: "بطولة كرة القدم السنوية 2024",
      category: "كرة قدم",
      date: "ديسمبر 2024",
      winner: "فريق الهندسة",
      runnerUp: "فريق المالية",
      thirdPlace: "فريق التشغيل",
      stats: {
        teams: 16,
        matches: 28,
        goals: 87,
      },
    },
    {
      id: 2,
      name: "دوري كرة السلة الداخلي 2024",
      category: "كرة سلة",
      date: "نوفمبر 2024",
      winner: "فريق تقنية المعلومات",
      runnerUp: "فريق الموارد البشرية",
      thirdPlace: "فريق المشتريات",
      stats: {
        teams: 8,
        matches: 16,
        goals: 892,
      },
    },
    {
      id: 3,
      name: "ماراثون أبراج الخيري 2024",
      category: "جري",
      date: "أكتوبر 2024",
      winner: "أحمد المطيري",
      runnerUp: "محمد العتيبي",
      thirdPlace: "خالد السالم",
      stats: {
        teams: 245,
        matches: 1,
        goals: 0,
      },
    },
  ];

  const featuredAthletes = [
    {
      id: 1,
      name: "عبدالله الشمري",
      position: "مهندس كهرباء",
      department: "قسم الهندسة",
      achievements: "هداف بطولة كرة القدم 2024 (18 هدف)",
      sport: "كرة قدم",
    },
    {
      id: 2,
      name: "سارة القحطاني",
      position: "محلل أعمال",
      department: "قسم تقنية المعلومات",
      achievements: "أفضل لاعبة في دوري كرة السلة النسائي",
      sport: "كرة سلة",
    },
    {
      id: 3,
      name: "محمد الدوسري",
      position: "مدير مشروع",
      department: "قسم التشغيل",
      achievements: "بطل ماراثون أبراج 2024 - 2023",
      sport: "جري",
    },
    {
      id: 4,
      name: "فاطمة العمري",
      position: "مدير موارد بشرية",
      department: "الموارد البشرية",
      achievements: "أفضل رياضية للعام 2024",
      sport: "متعدد",
    },
  ];

  const leaderboard = [
    { rank: 1, department: "قسم الهندسة", points: 450, trophies: 5, color: "text-gold" },
    { rank: 2, department: "قسم تقنية المعلومات", points: 380, trophies: 4, color: "text-muted-foreground" },
    { rank: 3, department: "قسم المالية", points: 320, trophies: 3, color: "text-victory" },
    { rank: 4, department: "قسم الموارد البشرية", points: 290, trophies: 2, color: "text-foreground" },
    { rank: 5, department: "قسم التشغيل", points: 250, trophies: 2, color: "text-foreground" },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-sm px-4 py-2" data-testid="badge-results">
            النتائج والإنجازات
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            لوحة الشرف والبطولات
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            نتائج البطولات وتكريم الأبطال والمتميزين رياضياً
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative h-80 rounded-xl overflow-hidden mb-16">
          <img
            src={awardsImage}
            alt="الجوائز والبطولات"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground drop-shadow-lg">
              احتفاء بالتميز الرياضي
            </h2>
          </div>
        </div>

        {/* Tournaments Results */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-8 w-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-bold">نتائج البطولات</h2>
          </div>
          
          <div className="space-y-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="overflow-hidden" data-testid={`tournament-${tournament.id}`}>
                <CardHeader className="bg-card border-b">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-display mb-2">{tournament.name}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{tournament.category}</Badge>
                        <Badge variant="outline">{tournament.date}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-base font-bold text-primary">{tournament.stats.teams}</div>
                        <div className="text-base text-muted-foreground">فريق</div>
                      </div>
                      <div>
                        <div className="text-base font-bold text-victory">{tournament.stats.matches}</div>
                        <div className="text-base text-muted-foreground">مباراة</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* First Place */}
                    <div className="text-center space-y-4 p-6 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/30">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gold text-gold-foreground flex items-center justify-center">
                        <Crown className="h-10 w-10" />
                      </div>
                      <div>
                        <p className="text-base text-muted-foreground mb-1">البطل</p>
                        <h3 className="text-xl font-display font-bold">{tournament.winner}</h3>
                      </div>
                      <Badge className="bg-gold text-gold-foreground">المركز الأول</Badge>
                    </div>

                    {/* Second Place */}
                    <div className="text-center space-y-4 p-6 rounded-xl bg-muted/50 border-2 border-muted">
                      <div className="w-20 h-20 mx-auto rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                        <Medal className="h-10 w-10" />
                      </div>
                      <div>
                        <p className="text-base text-muted-foreground mb-1">الوصيف</p>
                        <h3 className="text-xl font-display font-bold">{tournament.runnerUp}</h3>
                      </div>
                      <Badge variant="secondary">المركز الثاني</Badge>
                    </div>

                    {/* Third Place */}
                    <div className="text-center space-y-4 p-6 rounded-xl bg-gradient-to-br from-victory/20 to-victory/5 border-2 border-victory/30">
                      <div className="w-20 h-20 mx-auto rounded-full bg-victory text-victory-foreground flex items-center justify-center">
                        <Award className="h-10 w-10" />
                      </div>
                      <div>
                        <p className="text-base text-muted-foreground mb-1">المركز الثالث</p>
                        <h3 className="text-xl font-display font-bold">{tournament.thirdPlace}</h3>
                      </div>
                      <Badge className="bg-victory text-victory-foreground">المركز الثالث</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Star className="h-8 w-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-bold">لوحة الصدارة - الأقسام</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-right p-4 font-display font-bold">المركز</th>
                      <th className="text-right p-4 font-display font-bold">القسم</th>
                      <th className="text-center p-4 font-display font-bold">النقاط</th>
                      <th className="text-center p-4 font-display font-bold">البطولات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item) => (
                      <tr 
                        key={item.rank} 
                        className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                        data-testid={`leaderboard-${item.rank}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-md ${item.rank === 1 ? 'bg-gold text-gold-foreground' : 'bg-muted'} flex items-center justify-center font-bold`}>
                              {item.rank}
                            </div>
                            {item.rank === 1 && <Crown className="h-5 w-5 text-gold" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-display font-bold text-base">{item.department}</p>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="secondary" className="text-sm font-mono">{item.points}</Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Trophy className={`h-5 w-5 ${item.color}`} />
                            <span className="font-bold">{item.trophies}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Featured Athletes */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Award className="h-8 w-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-bold">اللاعبون المميزون</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAthletes.map((athlete) => (
              <Card key={athlete.id} className="text-center hover-elevate active-elevate-2 transition-all" data-testid={`athlete-${athlete.id}`}>
                <CardContent className="p-6 space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-victory flex items-center justify-center text-base font-display font-bold text-primary-foreground">
                    {athlete.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{athlete.name}</h3>
                    <p className="text-base text-muted-foreground">{athlete.position}</p>
                    <Badge variant="outline" className="mt-2">{athlete.department}</Badge>
                  </div>
                  <div className="pt-4 border-t">
                    <Trophy className="h-6 w-6 mx-auto text-gold mb-2" />
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {athlete.achievements}
                    </p>
                  </div>
                  <Badge className="bg-primary">{athlete.sport}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
