import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-bold text-primary">404</h1>
            <h2 className="text-2xl font-display font-bold">الصفحة غير موجودة</h2>
            <p className="text-muted-foreground">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
            </p>
          </div>

          <Link href="/">
            <Button size="lg" className="gap-2" data-testid="button-home">
              <Home className="h-5 w-5" />
              العودة للرئيسية
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
