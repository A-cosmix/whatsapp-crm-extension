import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductivityUI } from './components/ProductivityUI';
import { Features } from './components/Features';
import { AIExperience } from './components/AIExperience';
import { SocialProof } from './components/SocialProof';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { MouseSpotlight } from './components/effects/MouseSpotlight';
import { Particles } from './components/effects/Particles';
import { FloatingOrbs } from './components/effects/FloatingOrbs';

export function App() {
  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />
      <Particles />
      <MouseSpotlight />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ProductivityUI />
          <Features />
          <AIExperience />
          <SocialProof />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
