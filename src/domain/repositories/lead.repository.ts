import type { Lead } from '../entities/lead';
import type { LeadStage } from '../entities/lead';
import type { PhoneNumber } from '../value-objects/phone-number';

export interface ILeadRepository {
  findById(id: string): Promise<Lead | null>;
  findByPhone(phone: PhoneNumber): Promise<Lead | null>;
  findByChatId(chatId: string): Promise<Lead | null>;
  findByStage(stage: LeadStage): Promise<Lead[]>;
  findAll(): Promise<Lead[]>;
  save(lead: Lead): Promise<void>;
  delete(id: string): Promise<void>;
}
