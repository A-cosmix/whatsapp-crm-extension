import { ApplicationError } from '@domain/errors';
import type { ISettingsStore } from '@domain/services/platform.interfaces';
import type { IMessageBus } from '@domain/services/interfaces';
import { MessageTypes } from '@domain/messages';
import type { UpdateAIConfigDto, UpdateCrmSyncDto } from '../dto';

export class UpdateAIConfigUseCase {
  constructor(
    private readonly settings: ISettingsStore,
    private readonly messageBus: IMessageBus,
  ) {}

  async execute(input: UpdateAIConfigDto) {
    const current = await this.settings.getAIConfig();
    const updated = { ...current, ...input };
    await this.settings.setAIConfig(updated);
    await this.messageBus.publish(MessageTypes.SETTINGS_UPDATED, { type: 'ai' });
    return updated;
  }
}

export class UpdateCrmSyncUseCase {
  constructor(
    private readonly settings: ISettingsStore,
    private readonly messageBus: IMessageBus,
  ) {}

  async execute(input: UpdateCrmSyncDto) {
    if (input.enabled && !input.webhookUrl) {
      throw new ApplicationError('Webhook URL required when sync enabled', 'INVALID_CONFIG');
    }
    await this.settings.setCrmSyncConfig(input);
    await this.messageBus.publish(MessageTypes.SETTINGS_UPDATED, { type: 'crm' });
    return input;
  }
}

export class GetSettingsUseCase {
  constructor(private readonly settings: ISettingsStore) {}

  async execute() {
    const [ai, crm] = await Promise.all([
      this.settings.getAIConfig(),
      this.settings.getCrmSyncConfig(),
    ]);
    return { ai, crm };
  }
}
