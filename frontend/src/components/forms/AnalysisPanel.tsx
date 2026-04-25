import { useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { AnalysisResult, DetectedField } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

const typeLabel = (type: DetectedField["type"], t: any) =>
  ({ text: t("type_text"), date: t("type_date"), number: t("type_number"),
     checkbox: t("type_checkbox"), radio: t("type_radio") }[type]);

export const AnalysisPanel = ({ analysis }: { analysis: AnalysisResult }) => {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 rounded-2xl shadow-elegant border-border/70">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" /> {t("analysis_title")}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("analysis_understands_as")} <span className="font-semibold text-foreground">"{analysis.formType}"</span>{t("analysis_form_suffix")}
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full">{analysis.pageCount} pages</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{t("analysis_completeness")}</span>
              <span className="text-primary font-semibold">{analysis.coverage}%</span>
            </div>
            <Progress value={analysis.coverage} className="h-2" />
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-sm">
              <span className="font-medium">{t("analysis_detected_intro")} </span>
              <span className="font-semibold text-primary">{analysis.fields.length}</span>
              <span> {t("analysis_fields_word")}</span>
            </p>
            <Button variant="ghost" size="sm" className="mt-2 -ml-2 gap-1" onClick={() => setOpen(!open)}>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {open ? t("analysis_hide") : t("analysis_preview")}
            </Button>
            {open && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 animate-fade-up">
                {analysis.fields.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{f.label}</div>
                      <div className="text-xs text-muted-foreground">{typeLabel(f.type, t)}{f.required && " · *"}</div>
                    </div>
                    {f.matchedFromProfile ? (
                      <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10 gap-1 whitespace-nowrap">
                        <CheckCircle2 className="h-3 w-3" /> {t("matched")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground whitespace-nowrap">{t("manual")}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-2xl shadow-elegant border-border/70">
          <CardHeader><CardTitle className="text-base">{t("analysis_steps")}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">1</span>
              <span>{t("analysis_step1")}</span>
            </div>
            <div className="flex gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">2</span>
              <span>{t("analysis_step2")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-warning-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" /> {t("analysis_alerts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("analysis_alert_manual")}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
