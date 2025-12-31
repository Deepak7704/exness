import HeroSection from "./components/landing/HeroSection";
import DashboardPreview from "./components/landing/DashboardPreview";
import ArchitectureSection from "./components/landing/ArchitectureSection";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-primary">
      {/* Hero Section */}
      <HeroSection />

      {/* Dashboard Preview / Features Section */}
      <DashboardPreview />

      {/* Architecture & Technical Features Section */}
      <ArchitectureSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}