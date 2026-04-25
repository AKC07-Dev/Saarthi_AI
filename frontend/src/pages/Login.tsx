import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const Login = () => {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((er) => { if (er.path[0]) errs[er.path[0] as string] = er.message; });
      setErrors(errs); return;
    }
    setErrors({}); setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/forms");
    } catch { toast.error("Login failed. Please try again."); }
    finally { setLoading(false); }
  };

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
            Government forms, finally simple.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Upload, analyze, and autofill any form in seconds — in English or मराठी.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <Card className="w-full max-w-md rounded-2xl shadow-elegant border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-2xl">{t("auth_login_title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("auth_login_sub")}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth_email")}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1.5 ${errors.email ? "border-destructive" : ""}`} />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{t("auth_password")}</Label>
                  <button type="button" className="text-xs text-primary hover:underline">{t("auth_forgot")}</button>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`mt-1.5 ${errors.password ? "border-destructive" : ""}`} />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" disabled={loading}
                className="w-full gradient-hero text-primary-foreground border-0 shadow-glow gap-2 h-11">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("auth_signin")}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t("auth_no_account")}{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">{t("auth_signup")}</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
