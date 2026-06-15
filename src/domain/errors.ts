/**
 * Domain error for business rule violations.
 * Thrown by entities, value objects, and domain services.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'InfrastructureError';
  }
}
