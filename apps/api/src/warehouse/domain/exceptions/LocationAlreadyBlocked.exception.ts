import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class LocationAlreadyBlockedException extends DomainException {
  constructor(identifier?: string | number) {
    const message = identifier
      ? `Location ${identifier} is already blocked`
      : 'Location is already blocked'
    super(message, 'LOCATION_ALREADY_BLOCKED')
  }
}
