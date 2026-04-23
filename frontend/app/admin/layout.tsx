export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <header
        className="h-12 flex items-center px-6 gap-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="font-bold text-sm tracking-widest uppercase"
          style={{ color: "var(--or)", fontFamily: "var(--font-display)" }}
        >
          Sebastian · Admin
        </span>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
