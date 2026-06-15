import { DomainError } from '../errors';

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

const VALID_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['won', 'lost'],
  won: [],
  lost: [],
};

export function isValidStageTransition(from: LeadStage, to: LeadStage): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export interface LeadProps {
  id: string;
  phone: string;
  name: string;
  stage: LeadStage;
  chatId: string;
  tags: string[];
  notes: string;
  customFields: Record<string, string>;
  score?: number;
  scoreRationale?: string;
  source: 'whatsapp' | 'import' | 'manual';
  createdAt: number;
  updatedAt: number;
  lastContactedAt?: number;
  assignedTo?: string;
}

export class Lead {
  readonly id: string;
  readonly phone: string;
  name: string;
  stage: LeadStage;
  readonly chatId: string;
  tags: string[];
  notes: string;
  customFields: Record<string, string>;
  score?: number;
  scoreRationale?: string;
  readonly source: LeadProps['source'];
  readonly createdAt: number;
  updatedAt: number;
  lastContactedAt?: number;
  assignedTo?: string;

  private constructor(props: LeadProps) {
    this.id = props.id;
    this.phone = props.phone;
    this.name = props.name;
    this.stage = props.stage;
    this.chatId = props.chatId;
    this.tags = [...props.tags];
    this.notes = props.notes;
    this.customFields = { ...props.customFields };
    this.score = props.score;
    this.scoreRationale = props.scoreRationale;
    this.source = props.source;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lastContactedAt = props.lastContactedAt;
    this.assignedTo = props.assignedTo;
  }

  static create(input: {
    id: string;
    phone: string;
    name: string;
    chatId: string;
    source?: LeadProps['source'];
  }): Lead {
    const now = Date.now();
    return new Lead({
      id: input.id,
      phone: input.phone,
      name: input.name,
      stage: 'new',
      chatId: input.chatId,
      tags: [],
      notes: '',
      customFields: {},
      source: input.source ?? 'whatsapp',
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: LeadProps): Lead {
    return new Lead(props);
  }

  changeStage(newStage: LeadStage): void {
    if (!isValidStageTransition(this.stage, newStage)) {
      throw new DomainError(`Invalid stage transition: ${this.stage} → ${newStage}`);
    }
    this.stage = newStage;
    this.updatedAt = Date.now();
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = Date.now();
    }
  }

  updateScore(score: number, rationale: string): void {
    if (score < 0 || score > 100) {
      throw new DomainError('Score must be between 0 and 100');
    }
    this.score = score;
    this.scoreRationale = rationale;
    this.updatedAt = Date.now();
  }

  toJSON(): LeadProps {
    return {
      id: this.id,
      phone: this.phone,
      name: this.name,
      stage: this.stage,
      chatId: this.chatId,
      tags: [...this.tags],
      notes: this.notes,
      customFields: { ...this.customFields },
      score: this.score,
      scoreRationale: this.scoreRationale,
      source: this.source,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastContactedAt: this.lastContactedAt,
      assignedTo: this.assignedTo,
    };
  }
}
