import { Lead } from '@domain/entities/lead';
import type { LeadProps } from '@domain/entities/lead';
import type { LeadRow } from './dexie-storage';

export function leadToDomain(row: LeadRow): Lead {
  return Lead.reconstitute(row as LeadProps);
}

export function leadToRow(lead: Lead): LeadRow {
  return lead.toJSON();
}
