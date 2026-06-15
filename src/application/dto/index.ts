import { z } from 'zod';
import type { LeadStage } from '@domain/entities/lead';

export const CreateLeadDtoSchema = z.object({
  phone: z.string().min(1),
  name: z.string().min(1),
  chatId: z.string().min(1),
  source: z.enum(['whatsapp', 'import', 'manual']).optional(),
});

export type CreateLeadDto = z.infer<typeof CreateLeadDtoSchema>;

export const UpdateLeadStageDtoSchema = z.object({
  leadId: z.string().min(1),
  stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const satisfies readonly LeadStage[]),
});

export type UpdateLeadStageDto = z.infer<typeof UpdateLeadStageDtoSchema>;

export const CreateReminderDtoSchema = z.object({
  leadId: z.string().min(1),
  chatId: z.string().min(1),
  title: z.string().min(1),
  dueAt: z.number().positive(),
  note: z.string().optional(),
});

export type CreateReminderDto = z.infer<typeof CreateReminderDtoSchema>;

export const SendAutoReplyDtoSchema = z.object({
  chatId: z.string().min(1),
  messageText: z.string().min(1),
  messageId: z.string().min(1),
  isGroup: z.boolean(),
});

export type SendAutoReplyDto = z.infer<typeof SendAutoReplyDtoSchema>;

export const ToggleAutoReplyDtoSchema = z.object({
  chatId: z.string().min(1),
  enabled: z.boolean(),
});

export type ToggleAutoReplyDto = z.infer<typeof ToggleAutoReplyDtoSchema>;

export const CreateCampaignDtoSchema = z.object({
  name: z.string().min(1),
  template: z.string().min(1),
  leadIds: z.array(z.string()).min(1),
  scheduledAt: z.number().optional(),
});

export type CreateCampaignDto = z.infer<typeof CreateCampaignDtoSchema>;

export const SnoozeReminderDtoSchema = z.object({
  reminderId: z.string().min(1),
  snoozeUntil: z.number().positive(),
});

export type SnoozeReminderDto = z.infer<typeof SnoozeReminderDtoSchema>;

export const UpdateAIConfigDtoSchema = z.object({
  ollamaUrl: z.string().min(1).optional(),
  ollamaModel: z.string().optional(),
  autoReplyConfidenceThreshold: z.number().min(0).max(1).optional(),
  systemPrompt: z.string().optional(),
  dailyBulkCap: z.number().min(1).max(200).optional(),
});

export type UpdateAIConfigDto = z.infer<typeof UpdateAIConfigDtoSchema>;

export const UpdateCrmSyncDtoSchema = z.object({
  enabled: z.boolean(),
  webhookUrl: z.string(),
  apiKey: z.string().optional(),
});

export type UpdateCrmSyncDto = z.infer<typeof UpdateCrmSyncDtoSchema>;
