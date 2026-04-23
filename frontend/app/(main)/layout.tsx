import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
<<<<<<< HEAD
import SurpriseFAB from "@/components/ui/SurpriseFAB";
import PushNotificationManager from "@/components/notifications/PushNotificationManager";
=======
import SurpriseFab from "@/components/layout/SurpriseFab";
>>>>>>> main

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, oklch(0.807 0.094 78 / 0.12), transparent 22%), radial-gradient(circle at 10% 85%, oklch(0.495 0.228 26.5 / 0.1), transparent 24%)",
        }}
      />
      <Header />
      <main className="relative flex-1 flex flex-col pt-14 pb-16">
        <div className="container-app w-full flex-1 flex flex-col animate-[page-enter_360ms_ease-out]">
          {children}
        </div>
      </main>
<<<<<<< HEAD
      <PushNotificationManager />
      <SurpriseFAB />
=======
      <SurpriseFab />
>>>>>>> main
      <BottomNav />
    </div>
  );
}
