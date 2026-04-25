import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 animate-fade-up">{children}</main>
    <Footer />
  </div>
);
