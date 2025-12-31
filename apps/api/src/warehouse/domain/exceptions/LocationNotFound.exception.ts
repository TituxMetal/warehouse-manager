import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class LocationNotFoundException extends DomainException {
  constructor(identifier?: string | number) {
    const message = identifier ? `Location not found: ${identifier}` : 'Location not found'
    super(message, 'LOCATION_NOT_FOUND')
  }
}
