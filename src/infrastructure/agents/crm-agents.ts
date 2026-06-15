import type {
  IReplyTriageAgent,
  IOutreachAgent,
  ISupervisorAgent,
  TriageResult,
  OutreachDraft,
  SupervisorDecision,
  AgentHandoff,
} from '@domain/agents/agent.types';
import { createHandoff } from '@domain/agents/agent.types';
import type { ILLMProvider } from '@domain/services/interfaces';
import { collectLLMResponse } from '../llm/ollama-provider';

const ESCALATE_KEYWORDS = ['lawyer', 'legal', 'refund', 'complaint', 'manager', 'वकील', 'शिकायत'];
const INTERESTED_KEYWORDS = ['interested', 'price', 'cost', 'demo', 'call', 'दिलचस्पी', 'कीमत', 'डेमो'];
const NOT_INTERESTED_KEYWORDS = ['not interested', 'no thanks', 'stop', 'unsubscribe', 'नहीं चाहिए', 'बंद करो'];

function sanitizeProspectInput(text: string): string {
  return text.slice(0, 2000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

export class RuleBasedTriageAgent implements IReplyTriageAgent {
  readonly agentId = 'reply-triage-v1';

  async triage(message: string, provenance: 'prospect' | 'user') {
    const sanitized = sanitizeProspectInput(message);
    const lower = sanitized.toLowerCase();

    let intent: TriageResult['intent'] = 'ambiguous';
    let confidence = 0.6;
    let shouldAutoReply = true;
    let shouldEscalate = false;

    if (ESCALATE_KEYWORDS.some((k) => lower.includes(k))) {
      intent = 'ambiguous';
      shouldAutoReply = false;
      shouldEscalate = true;
      confidence = 0.9;
    } else if (NOT_INTERESTED_KEYWORDS.some((k) => lower.includes(k))) {
      intent = 'not_interested';
      shouldAutoReply = true;
      confidence = 0.85;
    } else if (INTERESTED_KEYWORDS.some((k) => lower.includes(k))) {
      intent = 'interested';
      shouldAutoReply = true;
      confidence = 0.88;
    } else if (lower.includes('?')) {
      intent = 'question';
      shouldAutoReply = true;
      confidence = 0.8;
    }

    const result: TriageResult = { intent, shouldAutoReply, shouldEscalate };

    return createHandoff(
      this.agentId,
      result,
      confidence,
      `Classified as ${intent}`,
      provenance === 'prospect' ? 'prospect' : 'user',
    );
  }
}

export class LLMOutreachAgent implements IOutreachAgent {
  readonly agentId = 'outreach-v1';

  constructor(
    private readonly llm: ILLMProvider,
    private readonly getModel: () => Promise<string>,
  ) {}

  async draft(context: string, template?: string) {
    const model = await this.getModel();
    const systemPrompt =
      template ??
      'You are a helpful sales assistant. Reply concisely in the same language as the customer.';

    const prompt = `Conversation history:\n${context}\n\nWrite a helpful reply to the last prospect message. Reply with only the message text, no quotes.`;

    const response = await collectLLMResponse(this.llm, {
      model,
      prompt,
      systemPrompt,
      maxTokens: 300,
      temperature: 0.7,
    });

    const draft: OutreachDraft = {
      message: response,
      tone: 'professional',
    };

    const confidence = response.length > 10 ? 0.82 : 0.5;

    return createHandoff(
      this.agentId,
      draft,
      confidence,
      'Generated reply via LLM',
      'system',
    );
  }
}

export class SupervisorAgent implements ISupervisorAgent {
  readonly agentId = 'supervisor-v1';

  async evaluate(handoff: AgentHandoff<unknown>): Promise<SupervisorDecision> {
    const payload = handoff.payload as TriageResult | OutreachDraft;

    if ('shouldEscalate' in payload && payload.shouldEscalate) {
      return {
        approved: false,
        action: 'escalate',
        reason: 'Escalation required — human review',
      };
    }

    if ('shouldAutoReply' in payload && !payload.shouldAutoReply) {
      return {
        approved: false,
        action: 'queue_review',
        reason: 'Triage blocked auto-reply',
      };
    }

    if (handoff.confidence < 0.5) {
      return {
        approved: false,
        action: 'queue_review',
        reason: 'Confidence below minimum',
      };
    }

    return {
      approved: true,
      action: 'send',
      reason: 'Approved by supervisor',
    };
  }
}
