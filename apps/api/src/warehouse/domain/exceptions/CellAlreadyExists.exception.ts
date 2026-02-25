import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class CellAlreadyExistsException extends DomainException {
  constructor(identifier?: string | number) {
    const message = identifier ? `Cell already exists: ${identifier}` : 'Cell already exists'
    super(message, 'CELL_ALREADY_EXISTS')
  }
}
