import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const registerFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      employeeId: "",
      department: "",
      position: "",
      phoneNumber: "",
      shiftPattern: "2weeks_on_2weeks_off",
      role: "employee",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في اللجنة الرياضية",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "فشل إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            انضم إلى اللجنة الرياضية - شركة أبراج لخدمات الطاقة
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-fullname">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-fullname" placeholder="الاسم الكامل" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-username">اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-username" placeholder="اسم المستخدم" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-email">البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-email" type="email" placeholder="example@abraj.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-employeeid">رقم الموظف</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-employeeid" placeholder="EMP001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-department">القسم</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-department" placeholder="قسم الهندسة" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-position">المنصب</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-position" placeholder="مهندس كهرباء" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-phone">رقم الجوال</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-phone" type="tel" placeholder="05xxxxxxxx" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shiftPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-shift">نظام الدوام</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-shift">
                            <SelectValue placeholder="اختر نظام الدوام" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2weeks_on_2weeks_off">2 أسبوع عمل / 2 أسبوع إجازة</SelectItem>
                          <SelectItem value="normal">دوام عادي</SelectItem>
                          <SelectItem value="flexible">دوام مرن</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-password">كلمة المرور</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-password" type="password" placeholder="6 أحرف على الأقل" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-confirm-password">تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-confirm-password" type="password" placeholder="أعد إدخال كلمة المرور" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="button-register"
              >
                {form.formState.isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                لديك حساب بالفعل؟{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => navigate("/login")}
                  data-testid="link-login"
                >
                  تسجيل الدخول
                </button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
