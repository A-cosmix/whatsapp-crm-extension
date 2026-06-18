import { AIChat } from '@momentum/components/AIChat';
import { SummaryPanel } from '@momentum/components/SummaryPanel';
import { useExtensionState } from '@momentum/hooks/use-extension-state';
import { Sparkles } from 'lucide-react';

export function SidebarApp() {
  const { state, loading } = useExtensionState();

  if (loading || !state) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--mx-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      <header className="flex items-center gap-2 mb-4 shrink-0">
        <div className="w-8 h-8 rounded-xl mx-glass flex items-center justify-center">
          <Sparkles size={16} style={{ color: 'var(--mx-accent)' }} />
        </div>
        <div>
          <h1 className="text-sm font-bold">Momentum <span style={{ color: 'var(--mx-accent)' }}>X</span></h1>
          <p className="text-[10px] opacity-40">AI Assistant</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 mb-4">
        <AIChat
          initialMessages={state.chatHistory}
          compact
          voiceEnabled={state.settings.voiceEnabled}
        />
      </div>

      <div className="shrink-0 space-y-3 max-h-[40%] overflow-y-auto">
        <SummaryPanel type="page" />
        <SummaryPanel type="youtube" />
      </div>
    </div>
  );
}
