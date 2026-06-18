import { useState } from 'react';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AppShell } from '@ui/app-shell';
import { OnboardingFlow } from '@ui/pages/onboarding-page';
import { LandingPage } from '@ui/pages/landing-page';
import { AuroraBackground } from '@ui/components/aurora-background';
import { useOnboardingStore } from '@ui/stores';
import '@ui/styles/globals.css';

function OptionsApp() {
  const { completed, complete, load } = useOnboardingStore();
  const [showLanding, setShowLanding] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    load().then(() => setReady(true));
  }, [load]);

  if (!ready) return null;

  if (showLanding && !completed) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!completed) {
    return (
      <div className="relative min-h-screen bg-hiremate-bg">
        <AuroraBackground intensity="medium" />
        <OnboardingFlow onComplete={complete} />
      </div>
    );
  }

  return <AppShell />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>,
);
