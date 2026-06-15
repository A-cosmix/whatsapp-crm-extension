import type { z } from 'zod';

export interface AgentHandoff<T> {
  contractVersion: '1.0';
  agentId: string;
  timestamp: string;
  confidence: number;
  rationale: string;
  payload: T;
  provenance: 'user' | 'prospect' | 'system';
}

export type ReplyIntent =
  | 'interested'
  | 'not_interested'
  | 'question'
  | 'objection'
  | 'scheduling'
  | 'out_of_office'
  | 'unsubscribe'
  | 'ambiguous';

export interface TriageResult {
  intent: ReplyIntent;
  shouldAutoReply: boolean;
  shouldEscalate: boolean;
}

export interface IReplyTriageAgent {
  readonly agentId: string;
  triage(message: string, provenance: 'prospect' | 'user'): Promise<AgentHandoff<TriageResult>>;
}

export interface ScoringResult {
  score: number;
  rationale: string;
}

export interface ILeadScoringAgent {
  readonly agentId: string;
  score(leadContext: string): Promise<AgentHandoff<ScoringResult>>;
}

export interface OutreachDraft {
  message: string;
  tone: 'professional' | 'friendly' | 'urgent';
}

export interface IOutreachAgent {
  readonly agentId: string;
  draft(context: string, template?: string): Promise<AgentHandoff<OutreachDraft>>;
}

export interface SupervisorDecision {
  approved: boolean;
  action: 'send' | 'queue_review' | 'escalate' | 'skip';
  reason: string;
}

export interface ISupervisorAgent {
  readonly agentId: string;
  evaluate(handoff: AgentHandoff<unknown>): Promise<SupervisorDecision>;
}

export function createHandoff<T>(
  agentId: string,
  payload: T,
  confidence: number,
  rationale: string,
  provenance: AgentHandoff<T>['provenance'],
): AgentHandoff<T> {
  return {
    contractVersion: '1.0',
    agentId,
    timestamp: new Date().toISOString(),
    confidence,
    rationale,
    payload,
    provenance,
  };
}

export type AgentHandoffSchema<T extends z.ZodType> = z.ZodType<AgentHandoff<z.infer<T>>>;
