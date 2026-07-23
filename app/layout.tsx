import type { Metadata } from "next";
import "./globals.css";
import NavTabs from "./nav-tabs";

export const metadata: Metadata = {
  title: "ARK Tracker — Registro da Tribo",
  description: "Genética, plantel e timers de breeding"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-camp-border bg-camp-panel/80 backdrop-blur sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-5 pt-4">
              <div className="flex items-baseline gap-3">
                <span className="text-camp-rust text-2xl">◆</span>
                <h1 className="font-display text-4xl text-camp-bone tracking-wide">
                  REGISTRO DA TRIBO
                </h1>
              </div>
              <p className="text-camp-dim text-xs mb-3 ml-8 -mt-1">genética · plantel · breeding</p>
              <NavTabs />
            </div>
          </header>
          <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">{children}</main>
          <footer className="text-center text-camp-dim text-xs py-6 border-t border-camp-border/60">
            feito pra sobreviver aos breeds ruins.
          </footer>
        </div>
      </body>
    </html>
  );
}
