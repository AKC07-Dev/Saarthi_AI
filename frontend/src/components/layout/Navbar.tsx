import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, Languages, Menu, FileText, LayoutDashboard, HelpCircle, User, LogOut, Sparkles } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = (t: (k: any) => string) => ([
  { to: "/", label: t("nav_dashboard"), Icon: LayoutDashboard },
  { to: "/forms", label: t("nav_forms"), Icon: FileText },
  { to: "/help", label: t("nav_help"), Icon: HelpCircle },
]);

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = navItems(t);

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "S";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-hero shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Saarthi <span className="text-gradient">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {items.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-base ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Toggle language" onClick={toggleLang}
            className="rounded-lg gap-1 px-2 w-auto text-xs font-semibold">
            <Languages className="h-4 w-4" />
            <span>{lang === "en" ? "EN" : "मराठी"}</span>
          </Button>

          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme} className="rounded-lg">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full ml-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="font-medium leading-tight">{user.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />{t("nav_profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }}>
                  <LogOut className="mr-2 h-4 w-4" />{t("nav_logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>{t("nav_login")}</Button>
              <Button size="sm" onClick={() => navigate("/register")} className="gradient-hero text-primary-foreground border-0 shadow-glow">
                {t("nav_register")}
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {items.map(({ to, label, Icon }) => (
                  <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                        isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`
                    }>
                    <Icon className="h-4 w-4" /> {label}
                  </NavLink>
                ))}
                {!user && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button variant="outline" onClick={() => { setOpen(false); navigate("/login"); }}>{t("nav_login")}</Button>
                    <Button className="gradient-hero text-primary-foreground border-0" onClick={() => { setOpen(false); navigate("/register"); }}>
                      {t("nav_register")}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
