import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, RefreshCw } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  onUpload: (file: File) => void;
  uploading?: boolean;
  current?: { name: string; sizeKB: number; pageCount?: number } | null;
  onClear?: () => void;
  onRescan?: () => void;
}

export const FormUploader = ({ onUpload, uploading, current, onClear, onRescan }: Props) => {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    const okTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!okTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload a PDF, JPG or PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max size is 10MB.");
      return;
    }
    onUpload(file);
  }, [onUpload]);

  if (current) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-elegant p-6 flex items-center gap-4 animate-fade-up">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{current.name}</p>
          <p className="text-sm text-muted-foreground">
            {current.pageCount ? `${current.pageCount} ${t("upload_pages")} · ` : ""}
            {current.sizeKB} KB
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRescan} className="gap-2">
          <RefreshCw className="h-4 w-4" /> {t("upload_scan_again")}
        </Button>
        <Button variant="ghost" size="icon" onClick={onClear} aria-label="Remove file">
          <X className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 md:p-14 text-center transition-base
        ${drag ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-card hover:border-primary/60 hover:bg-muted/50"}
        ${uploading ? "animate-soft-pulse pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-hero shadow-glow">
        <Upload className="h-8 w-8 text-primary-foreground" />
      </div>
      <h3 className="mt-5 text-lg md:text-xl font-semibold">{t("upload_drop")}</h3>
      <p className="mt-1 text-muted-foreground">{t("upload_or")}</p>
      <p className="mt-4 text-xs text-muted-foreground">{t("upload_supported")}</p>
    </div>
  );
};
