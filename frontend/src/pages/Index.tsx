import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, FileUp, BrainCircuit, Wand2, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goAutofill = () => navigate(user ? "/forms" : "/login");

  const useCases = [
    { key: "usecase_passport", emoji: "📘" },
    { key: "usecase_dl", emoji: "🚗" },
    { key: "usecase_pan", emoji: "🪪" },
    { key: "usecase_ration", emoji: "🍚" },
  ] as const;

  const steps = [
    { key: "step_upload", Icon: FileUp },
    { key: "step_analyze", Icon: BrainCircuit },
    { key: "step_autofill", Icon: Wand2 },
    { key: "step_validate", Icon: ShieldCheck },
  ] as const;

  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60 dark:opacity-40">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute top-20 -right-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        <div className="container py-16 md:py-24 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered government assistant
            </span>
            <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-gradient">{t("hero_title")}</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl">
              {t("hero_subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={goAutofill}
                className="gradient-hero text-primary-foreground border-0 shadow-glow gap-2 h-12 px-6 text-base">
                {t("hero_cta")} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base"
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
                {t("hero_secondary")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how" className="container">
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map(({ key, Icon }, idx) => (
            <Card key={key} className="rounded-2xl p-5 border-border/70 shadow-elegant gradient-card hover:shadow-elevated hover:-translate-y-0.5 transition-spring">
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">0{idx + 1}</span>
              </div>
              <p className="font-semibold">{t(key)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="container mt-16">
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">{t("usecase_title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map(({ key, emoji }) => (
            <div key={key}
              className="rounded-2xl border border-border bg-card p-5 shadow-elegant transition-spring hover:shadow-elevated hover:-translate-y-0.5">
              <div className="text-3xl">{emoji}</div>
              <p className="mt-3 font-medium">{t(key)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Saarthi AI compatible</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mt-16">
        <div className="rounded-3xl gradient-hero p-8 md:p-12 text-primary-foreground shadow-elevated overflow-hidden relative">
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h3 className="font-display text-2xl md:text-3xl font-semibold max-w-xl">
            Ready to fill your next form in seconds?
          </h3>
          <p className="mt-2 text-primary-foreground/80 max-w-xl">
            Upload your government form and let Saarthi AI handle the rest.
          </p>
          <Button size="lg" variant="secondary" onClick={goAutofill} className="mt-6 gap-2 h-12 px-6 bg-white text-primary hover:bg-white/90">
            {t("hero_cta")} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </AppShell>
  );
};

export default Index;
