import Sidebar from "@/components/Sidebar";
import BottomTabBar from "@/components/BottomTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>
      <BottomTabBar />
    </div>
  );
}
