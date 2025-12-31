import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class AisleNotFoundException extends DomainException {
  constructor(identifier?: string | number) {
    const message = identifier ? `Aisle not found: ${identifier}` : 'Aisle not found'
    super(message, 'AISLE_NOT_FOUND')
  }
}
