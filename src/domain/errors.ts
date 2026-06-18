export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class UsageLimitExceededError extends DomainError {
  constructor(feature: string) {
    super(`Free tier limit exceeded for ${feature}. Upgrade to Premium.`, 'USAGE_LIMIT_EXCEEDED');
  }
}

export class PremiumRequiredError extends DomainError {
  constructor(feature: string) {
    super(`${feature} requires a Premium subscription.`, 'PREMIUM_REQUIRED');
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends DomainError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_REQUIRED');
  }
}
