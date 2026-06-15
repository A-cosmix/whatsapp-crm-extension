import { describe, expect, it } from 'vitest';
import { Lead } from '@domain/entities/lead';
import { PhoneNumber } from '@domain/value-objects/phone-number';
import { DomainError } from '@domain/errors';

describe('PhoneNumber', () => {
  it('normalizes 10-digit Indian numbers', () => {
    const phone = new PhoneNumber('9876543210');
    expect(phone.value).toBe('+919876543210');
  });

  it('rejects invalid numbers', () => {
    expect(() => new PhoneNumber('abc')).toThrow(DomainError);
  });
});

describe('Lead', () => {
  it('allows valid stage transitions', () => {
    const lead = Lead.create({
      id: '1',
      phone: '+919876543210',
      name: 'Test',
      chatId: 'test_chat',
    });

    lead.changeStage('contacted');
    expect(lead.stage).toBe('contacted');
  });

  it('blocks invalid stage transitions', () => {
    const lead = Lead.create({
      id: '1',
      phone: '+919876543210',
      name: 'Test',
      chatId: 'test_chat',
    });

    expect(() => lead.changeStage('won')).toThrow(DomainError);
  });
});
