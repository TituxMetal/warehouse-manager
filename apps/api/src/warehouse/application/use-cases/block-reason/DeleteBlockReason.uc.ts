import { Injectable } from '@nestjs/common'

import {
  BlockReasonInUseException,
  BlockReasonNotFoundException
} from '~/warehouse/domain/exceptions'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class DeleteBlockReasonUseCase {
  constructor(private readonly blockReasonRepository: IBlockReasonRepository) {}

  async execute(id: number): Promise<void> {
    const exists = await this.blockReasonRepository.exists(id)

    if (!exists) {
      throw new BlockReasonNotFoundException(id)
    }

    const isInUse = await this.blockReasonRepository.isInUse(id)

    if (isInUse) {
      throw new BlockReasonInUseException(id)
    }

    await this.blockReasonRepository.delete(id)
  }
}
