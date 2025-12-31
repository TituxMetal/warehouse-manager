import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class BlockReasonNotFoundException extends DomainException {
  constructor(identifier?: string | number) {
    const message = identifier ? `Block reason not found: ${identifier}` : 'Block reason not found'
    super(message, 'BLOCK_REASON_NOT_FOUND')
  }
}
