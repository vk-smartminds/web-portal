import FeatureSection from "@/components/FeatureSection";
import StatsSection from "@/components/StatsSection";
import TopSection from "@/components/TopSection";

export default function LandingPage() {
  return (
    <main className="bg-white text-gray-900 min-h-screen overflow-hidden relative">
      <TopSection />
      <FeatureSection />
      <StatsSection />
    </main>
  );
}
