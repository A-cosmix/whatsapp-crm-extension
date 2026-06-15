import type { ICampaignRecipientRepository } from '@domain/repositories/campaign.repository';
import { CampaignRecipient } from '@domain/entities/campaign';
import { getDatabase } from './dexie-storage';

function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export class DexieCampaignRecipientRepository implements ICampaignRecipientRepository {
  async findByCampaignId(campaignId: string): Promise<CampaignRecipient[]> {
    const rows = await getDatabase().campaignRecipients
      .where('campaignId')
      .equals(campaignId)
      .toArray();
    return rows.map((r) => CampaignRecipient.reconstitute(r));
  }

  async findNextPending(campaignId: string): Promise<CampaignRecipient | null> {
    const row = await getDatabase().campaignRecipients
      .where({ campaignId, status: 'pending' })
      .first();
    return row ? CampaignRecipient.reconstitute(row) : null;
  }

  async save(recipient: CampaignRecipient): Promise<void> {
    await getDatabase().campaignRecipients.put(recipient.toJSON());
  }

  async saveMany(recipients: CampaignRecipient[]): Promise<void> {
    await getDatabase().campaignRecipients.bulkPut(recipients.map((r) => r.toJSON()));
  }

  async countSentToday(): Promise<number> {
    const start = todayStart();
    const rows = await getDatabase().campaignRecipients
      .where('status')
      .equals('sent')
      .filter((r) => (r.sentAt ?? 0) >= start)
      .toArray();
    return rows.length;
  }
}
