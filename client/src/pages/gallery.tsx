import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Heart, Footprints, Dumbbell, Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Gallery } from "@shared/schema";
import footballImage from "@assets/generated_images/Football_tournament_event_d6ff718f.png";
import familyImage from "@assets/generated_images/Family_sports_day_fb7dc0d7.png";
import marathonImage from "@assets/generated_images/Marathon_running_event_b03a4441.png";
import basketballImage from "@assets/generated_images/Basketball_tournament_action_c6044c35.png";
import awardsImage from "@assets/generated_images/Championship_awards_display_421aecd4.png";
import heroImage from "@assets/generated_images/Sports_celebration_hero_image_857d51d1.png";

const categoryImages: Record<string, string> = {
  football: footballImage,
  family: familyImage,
  marathon: marathonImage,
  basketball: basketballImage,
  awards: awardsImage,
  celebration: heroImage,
};

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data: galleryItems = [], isLoading } = useQuery<Gallery[]>({
    queryKey: ["/api/gallery"],
  });

  const categories = [
    { id: "all", label: "الكل", icon: Filter },
    { id: "football", label: "كرة القدم", icon: Trophy },
    { id: "family", label: "عائلي", icon: Heart },
    { id: "marathon", label: "جري وماراثون", icon: Footprints },
    { id: "basketball", label: "كرة السلة", icon: Dumbbell },
  ];

  const filteredGallery = activeFilter === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="text-base px-4 py-2" data-testid="badge-gallery">
            معرض الصور
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold">
            لحظات لا تُنسى
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            استعراض أجمل اللحظات من فعالياتنا وأنشطتنا الرياضية
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeFilter === category.id;
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveFilter(category.id)}
                className="gap-2"
                data-testid={`filter-${category.id}`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => {
            const image = item.imageUrl || categoryImages[item.category] || footballImage;
            return (
              <Card 
                key={item.id} 
                className="overflow-hidden group hover-elevate active-elevate-2 transition-all cursor-pointer"
                data-testid={`gallery-item-${item.id}`}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Badge className="mb-2">{item.eventDate ? new Date(item.eventDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }) : ""}</Badge>
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredGallery.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد صور في هذا القسم</h3>
            <p className="text-muted-foreground">جرب اختيار قسم آخر</p>
          </Card>
        )}
      </div>
    </div>
  );
}
