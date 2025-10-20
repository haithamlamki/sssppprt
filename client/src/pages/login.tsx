import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(username, password);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في اللجنة الرياضية",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message || "يرجى التحقق من اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            مرحباً بك في اللجنة الرياضية - شركة أبراج
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" data-testid="label-username">
                اسم المستخدم
              </Label>
              <Input
                id="username"
                data-testid="input-username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" data-testid="label-password">
                كلمة المرور
              </Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              ليس لديك حساب؟{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => navigate("/register")}
                data-testid="link-register"
              >
                إنشاء حساب جديد
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
