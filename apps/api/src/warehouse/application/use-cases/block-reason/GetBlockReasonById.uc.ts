import { Injectable } from '@nestjs/common'

import type { BlockReasonResponseDto } from '~/warehouse/application/dtos'
import { BlockReasonMapper } from '~/warehouse/application/mappers'
import { BlockReasonNotFoundException } from '~/warehouse/domain/exceptions'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetBlockReasonByIdUseCase {
  constructor(private readonly blockReasonRepository: IBlockReasonRepository) {}

  async execute(id: number): Promise<BlockReasonResponseDto> {
    const blockReason = await this.blockReasonRepository.findById(id)

    if (!blockReason) {
      throw new BlockReasonNotFoundException(id)
    }

    return BlockReasonMapper.toResponseDto(blockReason)
  }
}
