import { DomainException } from '~/shared/domain/exceptions/DomainException'

/**
 * Raised when `locationsPerAisle` cannot describe a physically buildable aisle.
 *
 * The reason is supplied by the rule evaluator (`evaluateLocationsPerAisleRule`) so the
 * message can state the physical constraint instead of only the bound. See decisions 003
 * and 004 in `docs/decisions/`.
 */
export class InvalidLocationsPerAisleException extends DomainException {
  constructor(received: number, reason: string) {
    super(
      `locationsPerAisle is invalid for the requested aisle configuration: ${reason}. Received: ${received}`,
      'INVALID_LOCATIONS_PER_AISLE'
    )
  }
}
