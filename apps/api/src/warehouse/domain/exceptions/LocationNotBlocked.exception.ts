import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class LocationNotBlockedException extends DomainException {
  constructor(identifier?: string | number) {
    const message = identifier ? `Location ${identifier} is not blocked` : 'Location is not blocked'
    super(message, 'LOCATION_NOT_BLOCKED')
  }
}
