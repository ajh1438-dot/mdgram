import HeroSection from "@/components/hero/HeroSection";
import ThemeToggle from "@/components/ThemeToggle";
import ExplorerSection from "@/components/explorer/ExplorerSection";

export default function Home() {
  return (
    <>
      {/* Fixed ThemeToggle in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero — fullscreen */}
      <HeroSection />

      {/* Explorer — inline outline view */}
      <ExplorerSection />
    </>
  );
}
