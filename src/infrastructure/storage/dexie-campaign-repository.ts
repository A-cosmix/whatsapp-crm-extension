import { Campaign } from '@domain/entities/campaign';
import type { ICampaignRepository } from '@domain/repositories/campaign.repository';
import type { CampaignStatus } from '@domain/entities/campaign';
import { getDatabase } from './dexie-storage';

export class DexieCampaignRepository implements ICampaignRepository {
  async findById(id: string): Promise<Campaign | null> {
    const row = await getDatabase().campaigns.get(id);
    return row ? Campaign.reconstitute(row) : null;
  }

  async findByStatus(status: CampaignStatus): Promise<Campaign[]> {
    const rows = await getDatabase().campaigns.where('status').equals(status).toArray();
    return rows.map((r) => Campaign.reconstitute(r));
  }

  async findAll(): Promise<Campaign[]> {
    const rows = await getDatabase().campaigns.orderBy('createdAt').reverse().toArray();
    return rows.map((r) => Campaign.reconstitute(r));
  }

  async save(campaign: Campaign): Promise<void> {
    await getDatabase().campaigns.put(campaign.toJSON());
  }
}
