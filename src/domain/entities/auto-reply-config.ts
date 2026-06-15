export interface AutoReplyConfigProps {
  chatId: string;
  enabled: boolean;
  systemPrompt?: string;
  maxHistoryMessages: number;
  minDelayMs: number;
  maxDelayMs: number;
  confidenceThreshold: number;
  excludeGroups: boolean;
}

export class AutoReplyConfig {
  readonly chatId: string;
  enabled: boolean;
  systemPrompt?: string;
  readonly maxHistoryMessages: number;
  readonly minDelayMs: number;
  readonly maxDelayMs: number;
  readonly confidenceThreshold: number;
  readonly excludeGroups: boolean;

  private constructor(props: AutoReplyConfigProps) {
    this.chatId = props.chatId;
    this.enabled = props.enabled;
    this.systemPrompt = props.systemPrompt;
    this.maxHistoryMessages = props.maxHistoryMessages;
    this.minDelayMs = props.minDelayMs;
    this.maxDelayMs = props.maxDelayMs;
    this.confidenceThreshold = props.confidenceThreshold;
    this.excludeGroups = props.excludeGroups;
  }

  static createDefault(chatId: string): AutoReplyConfig {
    return new AutoReplyConfig({
      chatId,
      enabled: false,
      maxHistoryMessages: 20,
      minDelayMs: 2000,
      maxDelayMs: 5000,
      confidenceThreshold: 0.75,
      excludeGroups: true,
    });
  }

  static reconstitute(props: AutoReplyConfigProps): AutoReplyConfig {
    return new AutoReplyConfig(props);
  }

  toggle(enabled: boolean): void {
    this.enabled = enabled;
  }

  toJSON(): AutoReplyConfigProps {
    return {
      chatId: this.chatId,
      enabled: this.enabled,
      systemPrompt: this.systemPrompt,
      maxHistoryMessages: this.maxHistoryMessages,
      minDelayMs: this.minDelayMs,
      maxDelayMs: this.maxDelayMs,
      confidenceThreshold: this.confidenceThreshold,
      excludeGroups: this.excludeGroups,
    };
  }
}
