import { Injectable } from '@nestjs/common'

import type { BlockReasonResponseDto } from '~/warehouse/application/dtos'
import { BlockReasonMapper } from '~/warehouse/application/mappers'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetAllBlockReasonsUseCase {
  constructor(private readonly blockReasonRepository: IBlockReasonRepository) {}

  async execute(): Promise<BlockReasonResponseDto[]> {
    const blockReasons = await this.blockReasonRepository.findAll()

    return blockReasons.map(entity => BlockReasonMapper.toResponseDto(entity))
  }
}
