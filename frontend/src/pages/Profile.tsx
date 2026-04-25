import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const rows: [string, string | undefined][] = [
    ["Name", user.name], ["Email", user.email],
    ["Date of birth", user.dob], ["Age", user.age ? String(user.age) : undefined],
    ["Gender", user.gender], ["Address", user.address], ["Phone", user.phone],
  ];

  return (
    <AppShell>
      <section className="container py-10 md:py-14 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">This is the data Saarthi AI uses to autofill your forms.</p>
        <Card className="mt-8 rounded-2xl shadow-elegant border-border/70">
          <CardHeader><CardTitle>Saved details</CardTitle></CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="col-span-2 text-sm font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
};

export default Profile;
