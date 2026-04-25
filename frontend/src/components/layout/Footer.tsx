import { useLang } from "@/context/LanguageContext";
import { Sparkles } from "lucide-react";

export const Footer = () => {
  const { t } = useLang();
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg gradient-hero">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display font-semibold">Saarthi AI</span>
        </div>
        <p className="text-sm text-muted-foreground">{t("footer_tag")}</p>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Saarthi AI</p>
      </div>
    </footer>
  );
};
