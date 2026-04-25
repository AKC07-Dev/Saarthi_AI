import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FormUploader } from "@/components/forms/FormUploader";
import { AnalysisPanel } from "@/components/forms/AnalysisPanel";
import { AutofillPanel } from "@/components/forms/AutofillPanel";
import { ValidationPanel } from "@/components/forms/ValidationPanel";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { api, AnalysisResult, ValidationResult } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";

interface UploadedMeta { name: string; sizeKB: number; pageCount: number; fileId: string; }

const FormAutofillPage = () => {
  const { user } = useAuth();
  const { t } = useLang();

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [meta, setMeta] = useState<UploadedMeta | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [values, setValues] = useState<Record<string, string>>({});
  const [autofilling, setAutofilling] = useState(false);
  const [hasAutofilled, setHasAutofilled] = useState(false);

  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  const reset = () => {
    setMeta(null); setAnalysis(null); setValues({}); setHasAutofilled(false); setValidation(null);
  };

  const handleUpload = async (file: File) => {
    reset();
    setUploading(true);
    try {
      const res = await api.upload(file);
      const m: UploadedMeta = { name: file.name, sizeKB: res.sizeKB, pageCount: res.pageCount, fileId: res.fileId };
      setMeta(m);
      toast.success("Form uploaded");
      setAnalyzing(true);
      const result = await api.analyze(res.fileId);
      setAnalysis(result);
      toast.success(`Detected ${result.fields.length} fields`);
    } catch (e) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false); setAnalyzing(false);
    }
  };

  const handleAutofill = async () => {
    if (!analysis) return;
    setAutofilling(true);
    try {
      const res = await api.autofill(analysis.fields, user);
      // small delay so the user sees the progress before fields render filled
      await new Promise((r) => setTimeout(r, 300));
      setValues(res.values);
      setHasAutofilled(true);
      toast.success(t("autofill_done"));
    } catch {
      toast.error("Autofill failed");
    } finally {
      setAutofilling(false);
    }
  };

  const handleValidate = async () => {
    if (!analysis) return;
    setValidating(true);
    try {
      const res = await api.validate(analysis.fields, values);
      setValidation(res);
      if (res.risk === "high") toast.warning("Several required fields are missing");
      else toast.success("Validation complete");
    } catch { toast.error("Validation failed"); }
    finally { setValidating(false); }
  };

  return (
    <AppShell>
      <section className="container py-10 md:py-14 space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{t("upload_title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{t("hero_subtitle")}</p>
        </div>

        <FormUploader
          onUpload={handleUpload}
          uploading={uploading}
          current={meta}
          onClear={reset}
          onRescan={() => meta && handleUpload(new File([], meta.name))}
        />

        {analyzing && !analysis && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
              <div className="space-y-6">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <>
            <AnalysisPanel analysis={analysis} />

            <AutofillPanel
              fields={analysis.fields}
              values={values}
              onValuesChange={setValues}
              onAutofill={handleAutofill}
              isAutofilling={autofilling}
              hasAutofilled={hasAutofilled}
            />

            {hasAutofilled && (
              <div className="flex justify-end">
                <Button onClick={handleValidate} disabled={validating} variant="outline" className="gap-2">
                  {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Run validation
                </Button>
              </div>
            )}

            {validation && <ValidationPanel result={validation} />}
          </>
        )}
      </section>
    </AppShell>
  );
};

export default FormAutofillPage;
