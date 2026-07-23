"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Visão Geral" },
  { href: "/dinos", label: "Genética" },
  { href: "/roster", label: "Plantel" },
  { href: "/timers", label: "Breeding" }
];

export default function NavTabs() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="flex gap-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm uppercase tracking-wide border-t border-x rounded-t-md transition-colors ${
              active
                ? "bg-camp-bg border-camp-border text-camp-rust font-bold"
                : "bg-camp-panel2/40 border-transparent text-camp-dim hover:text-camp-bone"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
