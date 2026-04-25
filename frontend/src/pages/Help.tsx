import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/context/LanguageContext";

const items = [
  { q: "What kinds of forms can I upload?", a: "Any government or institutional form in PDF, JPG, or PNG. Long multi-page PDFs work great." },
  { q: "Where does my data come from?", a: "From the profile you set up at signup. You can edit any auto-filled value before submitting." },
  { q: "Is my data safe?", a: "Your details stay on your device unless you choose to submit them. Saarthi AI does not share your data." },
  { q: "Can I switch languages?", a: "Yes — toggle between English and मराठी anytime from the navbar." },
];

const Help = () => {
  useLang(); // ensures re-render on lang change
  return (
    <AppShell>
      <section className="container py-10 md:py-14">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Help &amp; FAQ</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Quick answers to common questions about Saarthi AI.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <Card key={it.q} className="rounded-2xl shadow-elegant border-border/70">
              <CardHeader><CardTitle className="text-base">{it.q}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">{it.a}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

export default Help;
