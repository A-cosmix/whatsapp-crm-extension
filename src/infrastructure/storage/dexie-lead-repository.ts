import type { ILeadRepository } from '@domain/repositories/lead.repository';
import type { Lead } from '@domain/entities/lead';
import { PhoneNumber } from '@domain/value-objects/phone-number';
import type { LeadStage } from '@domain/entities/lead';
import { getDatabase } from './dexie-storage';
import { leadToDomain, leadToRow } from './mappers/lead.mapper';

export class DexieLeadRepository implements ILeadRepository {
  async findById(id: string): Promise<Lead | null> {
    const row = await getDatabase().leads.get(id);
    return row ? leadToDomain(row) : null;
  }

  async findByPhone(phone: PhoneNumber): Promise<Lead | null> {
    const row = await getDatabase().leads.where('phone').equals(phone.value).first();
    return row ? leadToDomain(row) : null;
  }

  async findByChatId(chatId: string): Promise<Lead | null> {
    const row = await getDatabase().leads.where('chatId').equals(chatId).first();
    return row ? leadToDomain(row) : null;
  }

  async findByStage(stage: LeadStage): Promise<Lead[]> {
    const rows = await getDatabase().leads.where('stage').equals(stage).toArray();
    return rows.map(leadToDomain);
  }

  async findAll(): Promise<Lead[]> {
    const rows = await getDatabase().leads.orderBy('updatedAt').reverse().toArray();
    return rows.map(leadToDomain);
  }

  async save(lead: Lead): Promise<void> {
    await getDatabase().leads.put(leadToRow(lead));
  }

  async delete(id: string): Promise<void> {
    await getDatabase().leads.delete(id);
  }
}
