import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class InvalidAisleRangeException extends DomainException {
  constructor(aisleStart: number, aisleEnd: number) {
    super(
      `aisleStart must be less than or equal to aisleEnd. Received: start=${aisleStart}, end=${aisleEnd}`,
      'INVALID_AISLE_RANGE'
    )
  }
}
