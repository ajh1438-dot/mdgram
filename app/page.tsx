"use client";

import dynamic from "next/dynamic";
import SettingsPanel from "@/components/SettingsPanel";

const HeroIntro = dynamic(() => import("@/components/intro/HeroIntro"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)]">
      <span className="text-[var(--text-muted)] text-sm animate-pulse">소개 로딩 중…</span>
    </div>
  ),
});

const AboutMe = dynamic(() => import("@/components/intro/AboutMe"), { ssr: false });
const MyCareer = dynamic(() => import("@/components/intro/MyCareer"), { ssr: false });
const MyInterests = dynamic(() => import("@/components/intro/MyInterests"), { ssr: false });
const BuildingProcess = dynamic(() => import("@/components/intro/BuildingProcess"), { ssr: false });
const GuestBook = dynamic(() => import("@/components/intro/GuestBook"), { ssr: false });

export default function Home() {
  const handleSwitchToMarkdown = () => {
    window.location.href = "/markdown";
  };

  return (
    <>
      {/* Settings gear — fixed top-right */}
      <div className="fixed top-4 right-4 z-50">
        <SettingsPanel />
      </div>

      <HeroIntro onSwitchToMarkdown={handleSwitchToMarkdown} />
      <AboutMe />
      <MyCareer />
      <MyInterests />
      <BuildingProcess />
      <GuestBook />
    </>
  );
}
