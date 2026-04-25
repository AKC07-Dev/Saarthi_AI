import { useEffect, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { DetectedField } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, Pencil, Download, Send, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Props {
  fields: DetectedField[];
  values: Record<string, string>;
  onValuesChange: (v: Record<string, string>) => void;
  onAutofill: () => Promise<void>;
  isAutofilling: boolean;
  hasAutofilled: boolean;
}

export const AutofillPanel = ({
  fields, values, onValuesChange, onAutofill, isAutofilling, hasAutofilled,
}: Props) => {
  const { t } = useLang();
  const [editMode, setEditMode] = useState(false);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  // Sequential field-fill animation when autofill completes
  useEffect(() => {
    if (!hasAutofilled) return;
    const ids = Object.keys(values).filter((k) => values[k]);
    setAnimatingIds(new Set());
    ids.forEach((id, i) => {
      setTimeout(() => {
        setAnimatingIds((prev) => {
          const next = new Set(prev); next.add(id); return next;
        });
        setTimeout(() => {
          setAnimatingIds((prev) => {
            const next = new Set(prev); next.delete(id); return next;
          });
        }, 700);
      }, i * 110);
    });
  }, [hasAutofilled]);

  const filledCount = fields.filter((f) => values[f.id]).length;
  const manualCount = fields.length - filledCount;

  return (
    <Card className="rounded-2xl shadow-elegant border-border/70">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" /> {t("autofill_title")}
          </CardTitle>
          {hasAutofilled && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-semibold text-success">{filledCount}</span> {t("autofill_summary_filled")} ·{" "}
              <span className="font-semibold text-warning">{manualCount}</span> {t("autofill_summary_manual")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasAutofilled && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm">
              {editMode ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{editMode ? t("autofill_edit") : t("autofill_preview")}</span>
              <Switch checked={editMode} onCheckedChange={setEditMode} />
            </div>
          )}
          <Button
            onClick={onAutofill}
            disabled={isAutofilling}
            className="gradient-hero text-primary-foreground border-0 shadow-glow gap-2"
          >
            {isAutofilling ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t("autofill_running")}</>
            ) : (
              <><Sparkles className="h-4 w-4" /> {t("autofill_button")}</>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => {
            const val = values[f.id] ?? "";
            const isFilled = !!val;
            const isAnim = animatingIds.has(f.id);
            const isMissing = hasAutofilled && f.required && !isFilled;

            return (
              <div
                key={f.id}
                id={`field-${f.id}`}
                className={`rounded-xl border p-4 transition-base ${
                  isAnim ? "field-fill-anim" : ""
                } ${
                  isFilled ? "border-success/40 bg-success/5" :
                  isMissing ? "border-destructive/40 bg-destructive/5" :
                  hasAutofilled ? "border-warning/40 bg-warning/5" :
                  "border-border bg-card"
                }`}
              >
                <Label htmlFor={f.id} className="text-xs uppercase tracking-wide text-muted-foreground">
                  {f.label}{f.required && " *"}
                </Label>
                {editMode || !hasAutofilled ? (
                  <Input
                    id={f.id}
                    value={val}
                    placeholder={hasAutofilled ? t("manual") : "—"}
                    onChange={(e) => onValuesChange({ ...values, [f.id]: e.target.value })}
                    className="mt-1 bg-background"
                  />
                ) : (
                  <div className="mt-2 min-h-[2rem] text-sm font-medium">
                    {isFilled ? val : <span className="text-muted-foreground italic">{t("manual")}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {hasAutofilled && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2" onClick={() => toast.success("Download started")}>
              <Download className="h-4 w-4" /> {t("autofill_download")}
            </Button>
            <Button className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => toast.success("Form submitted successfully")}>
              <Send className="h-4 w-4" /> {t("autofill_submit")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
