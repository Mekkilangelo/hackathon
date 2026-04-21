"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Accueil",
    icon: HomeIcon,
  },
  {
    href: "/chat",
    label: "Chat",
    icon: ChatIcon,
  },
  {
    href: "/profile",
    label: "Profil",
    icon: ProfileIcon,
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="container-app">
        <div className="flex items-center justify-around bg-card border-t border-border h-16 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                  active
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon active={active} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path d="M7.5 18V13h5v5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H6l-3 3V5z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle
        cx="10"
        cy="7"
        r="3.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
