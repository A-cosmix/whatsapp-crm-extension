import { describe, expect, it } from 'vitest';
import { personalizeTemplate } from '@domain/entities/campaign';

describe('personalizeTemplate', () => {
  it('replaces name and phone variables', () => {
    const result = personalizeTemplate('Hi {{name}}, your number is {{phone}}', {
      name: 'Rahul',
      phone: '+919876543210',
    });
    expect(result).toBe('Hi Rahul, your number is +919876543210');
  });
});
