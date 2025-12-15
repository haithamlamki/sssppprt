import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Upload, CalendarIcon, User, Users, Shirt } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

const registerFormSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  employeeId: z.string().min(1, "رقم الموظف مطلوب"),
  department: z.string().min(1, "القسم مطلوب"),
  position: z.string().min(1, "المنصب مطلوب"),
  phoneNumber: z.string().optional(),
  instagramAccount: z.string().optional(),
  shiftPattern: z.string().default("2weeks_on_2weeks_off"),
  accountType: z.enum(["standard", "player", "committee"]),
  unit: z.string().optional(),
  directManager: z.string().optional(),
  ds: z.string().optional(),
  committeeTitle: z.string().optional(),
  workStartDate: z.date().optional(),
  workEndDate: z.date().optional(),
  playerNumber: z.string().optional(),
  playerPosition: z.string().optional(),
  playerLevel: z.string().optional(),
  playerDateOfBirth: z.date().optional(),
  playerHealthStatus: z.string().optional(),
  playerPrimaryJersey: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === "committee" && !data.committeeTitle) {
    return false;
  }
  return true;
}, {
  message: "المسمى في اللجنة مطلوب",
  path: ["committeeTitle"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [accountImage, setAccountImage] = useState<File | null>(null);
  const [accountImagePreview, setAccountImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [employeeCardImage, setEmployeeCardImage] = useState<File | null>(null);
  const [nationalIdImage, setNationalIdImage] = useState<File | null>(null);
  const [healthInsuranceImage, setHealthInsuranceImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      instagramAccount: "",
      shiftPattern: "2weeks_on_2weeks_off",
      accountType: "standard",
      unit: "",
      directManager: "",
      ds: "",
      committeeTitle: "",
      playerNumber: "",
      playerPosition: "",
      playerLevel: "",
      playerHealthStatus: "fit",
      playerPrimaryJersey: "",
    },
  });

  const accountType = form.watch("accountType");
  const shiftPattern = form.watch("shiftPattern");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("employeeId", data.employeeId);
      formData.append("department", data.department);
      formData.append("position", data.position);
      formData.append("phoneNumber", data.phoneNumber || "");
      formData.append("instagramAccount", data.instagramAccount || "");
      formData.append("shiftPattern", data.shiftPattern);
      formData.append("accountType", data.accountType);
      formData.append("unit", data.unit || "");
      formData.append("directManager", data.directManager || "");
      formData.append("ds", data.ds || "");
      
      if (data.committeeTitle) {
        formData.append("committeeTitle", data.committeeTitle);
      }
      
      if (data.workStartDate) {
        formData.append("workStartDate", data.workStartDate.toISOString());
      }
      if (data.workEndDate) {
        formData.append("workEndDate", data.workEndDate.toISOString());
      }

      if (data.accountType === "player") {
        const playerInfo = {
          number: data.playerNumber,
          position: data.playerPosition,
          level: data.playerLevel,
          dateOfBirth: data.playerDateOfBirth?.toISOString(),
          healthStatus: data.playerHealthStatus,
          primaryJersey: data.playerPrimaryJersey,
        };
        formData.append("playerInfo", JSON.stringify(playerInfo));
      }

      if (accountImage) {
        formData.append("accountImage", accountImage);
      }
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }
      if (employeeCardImage) {
        formData.append("employeeCardImage", employeeCardImage);
      }
      if (nationalIdImage) {
        formData.append("nationalIdImage", nationalIdImage);
      }
      if (healthInsuranceImage) {
        formData.append("healthInsuranceImage", healthInsuranceImage);
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل إنشاء الحساب");
      }

      // Invalidate auth query to update user state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  const handleAccountImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAccountImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccountImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative">
              {accountImagePreview ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                  <img 
                    src={accountImagePreview} 
                    alt="صورة الحساب" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-primary/10 p-4 rounded-full">
                  <Trophy className="w-12 h-12 text-primary" />
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <label className="text-base font-medium cursor-pointer text-primary hover:text-primary/80">
                {accountImagePreview ? "تغيير صورة الحساب" : "إضافة صورة الحساب"}
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAccountImageChange}
                className="hidden"
                id="account-image-input"
                data-testid="input-account-image"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("account-image-input")?.click()}
                className="text-base"
              >
                {accountImagePreview ? "تغيير" : "اختر صورة"}
              </Button>
            </div>
          </div>
          <CardTitle className="text-xl">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            انضم إلى اللجنة الرياضية - شركة أبراج لخدمات الطاقة
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-fullname">الاسم الكامل *</FormLabel>
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
                        <FormLabel data-testid="label-username">اسم المستخدم *</FormLabel>
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
                        <FormLabel data-testid="label-email">البريد الإلكتروني *</FormLabel>
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
                        <FormLabel data-testid="label-employeeid">رقم الموظف *</FormLabel>
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
                        <FormLabel data-testid="label-department">القسم *</FormLabel>
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
                        <FormLabel data-testid="label-position">المنصب *</FormLabel>
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
                          <Input 
                            {...field} 
                            data-testid="input-phone" 
                            type="tel" 
                            placeholder="xxxxxxxx" 
                            dir="ltr"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagramAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-instagram">حساب الانستجرام</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            data-testid="input-instagram" 
                            type="text" 
                            placeholder="@username" 
                            dir="ltr"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  نوع الحساب
                </h3>
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-account-type">نوع الحساب *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-account-type" className="text-right" dir="rtl">
                            <SelectValue placeholder="اختر نوع الحساب" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">موظف ابراج</SelectItem>
                          <SelectItem value="player">لاعب ابراج</SelectItem>
                          <SelectItem value="committee">عضو اللجنة الإدارية</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {accountType === "standard" && "يمكنك التسجيل في الفعاليات ومشاهدة المحتوى"}
                        {accountType === "player" && "تسجيل بيانات لاعب"}
                        {accountType === "committee" && "ستحصل على صلاحيات إدارية إضافية"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {accountType === "committee" && (
                  <FormField
                    control={form.control}
                    name="committeeTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-committee-title">المسمى في إدارة اللجنة *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-committee-title" placeholder="مثال: رئيس اللجنة، أمين الصندوق" className="text-right" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {accountType === "player" && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Shirt className="w-5 h-5" />
                    معلومات اللاعب
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="playerNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم القميص</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-player-number" type="number" placeholder="10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="playerPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المركز</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-player-position">
                                <SelectValue placeholder="اختر المركز" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="goalkeeper">حارس مرمى</SelectItem>
                              <SelectItem value="defender">مدافع</SelectItem>
                              <SelectItem value="midfielder">لاعب وسط</SelectItem>
                              <SelectItem value="forward">مهاجم</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="playerLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المستوى</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-player-level">
                                <SelectValue placeholder="اختر المستوى" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">مبتدئ</SelectItem>
                              <SelectItem value="intermediate">متوسط</SelectItem>
                              <SelectItem value="advanced">متقدم</SelectItem>
                              <SelectItem value="professional">محترف</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="playerHealthStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحالة الصحية</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-player-health">
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fit">لائق</SelectItem>
                              <SelectItem value="injured">مصاب</SelectItem>
                              <SelectItem value="recovering">يتعافى</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="playerDateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>تاريخ الميلاد</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-right font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  data-testid="button-player-dob"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP", { locale: ar }) : "اختر التاريخ"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  نظام الدوام والتوافر
                </h3>
                <div className={`grid grid-cols-1 gap-4 items-start ${shiftPattern !== "normal" ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
                  <FormField
                    control={form.control}
                    name="shiftPattern"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel data-testid="label-shift">نظام الدوام</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value === "normal") {
                              form.setValue("workStartDate", undefined);
                              form.setValue("workEndDate", undefined);
                              form.setValue("unit", "");
                              form.setValue("directManager", "");
                              form.setValue("ds", "");
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-shift">
                              <SelectValue placeholder="اختر نظام الدوام" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="2weeks_on_2weeks_off">صحراء 2 أسبوع عمل / 2 أسبوع إجازة</SelectItem>
                            <SelectItem value="normal">دوام كامل</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {shiftPattern !== "normal" && (
                    <>
                      <FormField
                        control={form.control}
                        name="workStartDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>تاريخ بداية العمل</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-right font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="button-work-start"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: ar }) : "اختر التاريخ"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>تاريخ نهاية العمل</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-right font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    data-testid="button-work-end"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: ar }) : "اختر التاريخ"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>

              {shiftPattern !== "normal" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    معلومات العمل
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-unit">الوحدة</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-unit" placeholder="الوحدة" className="text-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="directManager"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-direct-manager">المسؤول المباشر</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-direct-manager" placeholder="المسؤول المباشر" className="text-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-ds">الDS</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-ds" placeholder="الDS" className="text-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  الصور والمستندات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-base font-medium">صورة شخصية</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setProfileImage)}
                        className="cursor-pointer"
                        data-testid="input-profile-image"
                      />
                    </div>
                    {profileImage && (
                      <p className="text-base text-muted-foreground">{profileImage.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-medium">صورة بطاقة العمل</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setEmployeeCardImage)}
                        className="cursor-pointer"
                        data-testid="input-employee-card"
                      />
                    </div>
                    {employeeCardImage && (
                      <p className="text-base text-muted-foreground">{employeeCardImage.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-medium">صورة الهوية</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setNationalIdImage)}
                        className="cursor-pointer"
                        data-testid="input-national-id"
                      />
                    </div>
                    {nationalIdImage && (
                      <p className="text-base text-muted-foreground">{nationalIdImage.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-base font-medium">صورة التأمين الصحي</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setHealthInsuranceImage)}
                        className="cursor-pointer"
                        data-testid="input-health-insurance"
                      />
                    </div>
                    {healthInsuranceImage && (
                      <p className="text-base text-muted-foreground">{healthInsuranceImage.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">كلمة المرور</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-password">كلمة المرور *</FormLabel>
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
                        <FormLabel data-testid="label-confirm-password">تأكيد كلمة المرور *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-confirm-password" type="password" placeholder="أعد إدخال كلمة المرور" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-register"
              >
                {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </Button>
              <div className="text-base text-center text-muted-foreground">
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
