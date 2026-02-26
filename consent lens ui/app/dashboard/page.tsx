import { DashboardHeader } from "@/components/dashboard/header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { DashboardContent } from "@/components/dashboard/content";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#05050a]">
      <DashboardHeader />
      <div className="flex-1 px-8 py-12">
        <DashboardContent />
      </div>
    </div>
  );
}
