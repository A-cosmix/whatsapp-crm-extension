import { DomainError } from '../errors';

export class PhoneNumber {
  readonly value: string;

  constructor(raw: string) {
    const normalized = PhoneNumber.normalize(raw);
    if (!PhoneNumber.isValid(normalized)) {
      throw new DomainError(`Invalid phone number: ${raw}`);
    }
    this.value = normalized;
  }

  private static normalize(raw: string): string {
    const digits = raw.replace(/[^\d+]/g, '');
    if (digits.startsWith('+')) return digits;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  }

  private static isValid(normalized: string): boolean {
    return /^\+[1-9]\d{6,14}$/.test(normalized);
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }
}
