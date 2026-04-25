import { useLang } from "@/context/LanguageContext";
import { ValidationResult } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";

const riskColor = (r: ValidationResult["risk"]) =>
  r === "low" ? "bg-success/15 text-success border-success/30"
  : r === "medium" ? "bg-warning/15 text-warning-foreground border-warning/30"
  : "bg-destructive/15 text-destructive border-destructive/30";

export const ValidationPanel = ({ result }: { result: ValidationResult }) => {
  const { t } = useLang();
  const riskLabel = result.risk === "low" ? t("validation_low")
    : result.risk === "medium" ? t("validation_medium") : t("validation_high");

  const jumpTo = (id: string) => {
    const el = document.getElementById(`field-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.classList.add("ring-2", "ring-primary");
    setTimeout(() => el?.classList.remove("ring-2", "ring-primary"), 1600);
  };

  return (
    <Card className="rounded-2xl shadow-elegant border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" /> {t("validation_title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{t("validation_score")}</span>
            <span className="font-semibold">{result.score}%</span>
          </div>
          <Progress value={result.score} className="h-2" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{t("validation_risk")}</span>
          <Badge variant="outline" className={`rounded-full ${riskColor(result.risk)}`}>{riskLabel}</Badge>
        </div>

        {result.errors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" /> {t("validation_errors")}
            </h4>
            <ul className="space-y-2">
              {result.errors.map((e) => (
                <li key={e.fieldId} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
                  <div className="flex gap-2 min-w-0">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      e.severity === "high" ? "text-destructive" : e.severity === "medium" ? "text-warning" : "text-muted-foreground"
                    }`} />
                    <span className="text-sm">{e.message}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 flex-shrink-0" onClick={() => jumpTo(e.fieldId)}>
                    {t("validation_jump")} <ArrowRight className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">{t("validation_suggestions")}</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
