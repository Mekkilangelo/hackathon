import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center">
      <div className="container-app">
        <div className="flex items-center justify-between h-14 px-1">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Logo Sebastian — étoile stylisée avec nœud papillon */}
            <SebastianLogo />
            <span
              className="text-lg font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sebastian
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SebastianLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Sebastian"
    >
      {/* Étoile 6 branches */}
      <path
        d="M16 2 L18.5 9.5 L26 7 L21 13.5 L28 16 L21 18.5 L26 25 L18.5 22.5 L16 30 L13.5 22.5 L6 25 L11 18.5 L4 16 L11 13.5 L6 7 L13.5 9.5 Z"
        fill="var(--rouge)"
        opacity="0.9"
      />
      {/* Yeux discrets */}
      <circle cx="13.5" cy="13.5" r="1.2" fill="white" opacity="0.9" />
      <circle cx="18.5" cy="13.5" r="1.2" fill="white" opacity="0.9" />
      {/* Nœud papillon minimaliste */}
      <path
        d="M13 20.5 L15.5 19 L15.5 22 Z"
        fill="white"
        opacity="0.8"
      />
      <path
        d="M19 20.5 L16.5 19 L16.5 22 Z"
        fill="white"
        opacity="0.8"
      />
      <circle cx="16" cy="20.5" r="0.8" fill="var(--champagne)" />
    </svg>
  );
}

export { SebastianLogo };
