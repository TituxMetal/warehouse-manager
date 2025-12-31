import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class CellNotFoundException extends DomainException {
  constructor(identifier?: string | number) {
    const message = identifier ? `Cell not found: ${identifier}` : 'Cell not found'
    super(message, 'CELL_NOT_FOUND')
  }
}
