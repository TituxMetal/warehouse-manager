import { DomainException } from '~/shared/domain/exceptions/DomainException'

export class InvalidLevelCountException extends DomainException {
  constructor(message: string) {
    super(message, 'INVALID_LEVEL_COUNT')
  }
}
