import type { Campaign, CampaignRecipient } from '../entities/campaign';
import type { CampaignStatus } from '../entities/campaign';

export interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  findByStatus(status: CampaignStatus): Promise<Campaign[]>;
  findAll(): Promise<Campaign[]>;
  save(campaign: Campaign): Promise<void>;
}

export interface ICampaignRecipientRepository {
  findByCampaignId(campaignId: string): Promise<CampaignRecipient[]>;
  findNextPending(campaignId: string): Promise<CampaignRecipient | null>;
  save(recipient: CampaignRecipient): Promise<void>;
  saveMany(recipients: CampaignRecipient[]): Promise<void>;
  countSentToday(): Promise<number>;
}
