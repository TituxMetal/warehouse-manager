import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class InvalidPositionCountException extends DomainException {
  constructor(received: number, minimum: number = 3) {
    super(
      `locationsPerAisle must be at least ${minimum} (one bay requires minimum ${minimum} positions). Received: ${received}`,
      'INVALID_POSITION_COUNT'
    )
  }
}
