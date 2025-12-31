import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class BayNotFoundException extends DomainException {
  constructor(identifier?: string | number) {
    super(identifier ? `Bay not found: ${identifier}` : 'Bay not found', 'BAY_NOT_FOUND')
  }
}
