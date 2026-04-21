import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col pt-14 pb-16">
        <div className="container-app w-full flex-1 flex flex-col">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
