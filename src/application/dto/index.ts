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
