import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AppShell } from '@ui/app-shell';
import { OnboardingFlow } from '@ui/pages/onboarding-page';
import { LandingPage } from '@ui/pages/landing-page';
import { useOnboardingStore } from '@ui/stores';

function OptionsApp() {
  const { completed, complete, load } = useOnboardingStore();
  const [showLanding, setShowLanding] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    load().then(() => setReady(true));
  }, [load]);

  if (!ready) return null;

  if (showLanding && !completed) {
    return (
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
      />
    );
  }

  if (!completed) {
    return <OnboardingFlow onComplete={complete} />;
  }

  return <AppShell />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>,
);
