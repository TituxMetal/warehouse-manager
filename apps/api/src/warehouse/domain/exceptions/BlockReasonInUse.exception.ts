import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class BlockReasonInUseException extends DomainException {
  constructor(identifier?: string | number) {
    const message = identifier
      ? `Block reason ${identifier} is in use and cannot be deleted`
      : 'Block reason is in use and cannot be deleted'
    super(message, 'BLOCK_REASON_IN_USE')
  }
}
