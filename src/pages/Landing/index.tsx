import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TutorialVideoSection from '@/components/TutorialVideoSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import AudienceSection from '@/components/AudienceSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import PackagesSection from '@/components/PackagesSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TutorialVideoSection />
        <FeaturesSection />
        <AudienceSection />
        <HowItWorksSection />
        <StatsSection />
        <PackagesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
