import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], { errorMap: () => ({ message: "Please select gender" }) }),
  address: z.string().trim().min(5, "Please enter your address").max(500),
  password: z.string().min(6, "At least 6 characters").max(100),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

const Register = () => {
  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", dob: "", gender: "" as any, address: "",
    password: "", confirm: "",
  });
  const [age, setAge] = useState<number | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // auto-calc age
  useEffect(() => {
    if (!form.dob) { setAge(""); return; }
    const d = new Date(form.dob); const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    setAge(isNaN(a) ? "" : a);
  }, [form.dob]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((er) => { if (er.path[0]) errs[er.path[0] as string] = er.message; });
      setErrors(errs); return;
    }
    setErrors({}); setLoading(true);
    try {
      await register({
        name: form.name, email: form.email, dob: form.dob,
        age: typeof age === "number" ? age : undefined,
        gender: form.gender, address: form.address,
        password: form.password,
      });
      toast.success("Account created");
      navigate("/forms");
    } catch { toast.error("Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  const fieldErr = (k: string) => errors[k] ? "border-destructive" : "";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden gradient-hero p-12 text-primary-foreground items-end">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />
        <div className="relative max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold">Saarthi AI</span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Your AI saathi for every form.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Save your details once. We'll autofill every government form for you.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <Card className="w-full max-w-xl rounded-2xl shadow-elegant border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-2xl">{t("auth_register_title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("auth_register_sub")}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>{t("auth_name")}</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} className={`mt-1.5 ${fieldErr("name")}`} />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <Label>{t("auth_dob")}</Label>
                <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className={`mt-1.5 ${fieldErr("dob")}`} />
                {errors.dob && <p className="mt-1 text-xs text-destructive">{errors.dob}</p>}
              </div>
              <div>
                <Label>{t("auth_age")}</Label>
                <Input type="number" value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1.5" />
              </div>
              <div>
                <Label>{t("auth_gender")}</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger className={`mt-1.5 ${fieldErr("gender")}`}><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">{t("auth_male")}</SelectItem>
                    <SelectItem value="Female">{t("auth_female")}</SelectItem>
                    <SelectItem value="Other">{t("auth_other")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="mt-1 text-xs text-destructive">{errors.gender}</p>}
              </div>
              <div>
                <Label>{t("auth_email")}</Label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={`mt-1.5 ${fieldErr("email")}`} />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label>{t("auth_address")}</Label>
                <Textarea value={form.address} onChange={(e) => set("address", e.target.value)}
                  className={`mt-1.5 ${fieldErr("address")}`} rows={2} />
                {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
              </div>
              <div>
                <Label>{t("auth_password")}</Label>
                <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className={`mt-1.5 ${fieldErr("password")}`} />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
              </div>
              <div>
                <Label>{t("auth_confirm")}</Label>
                <Input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} className={`mt-1.5 ${fieldErr("confirm")}`} />
                {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
              </div>

              <Button type="submit" disabled={loading}
                className="sm:col-span-2 gradient-hero text-primary-foreground border-0 shadow-glow gap-2 h-11">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("auth_signup")}
              </Button>
              <p className="sm:col-span-2 text-center text-sm text-muted-foreground">
                {t("auth_have_account")}{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">{t("auth_signin")}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
