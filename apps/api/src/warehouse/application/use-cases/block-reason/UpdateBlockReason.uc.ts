import { Injectable } from '@nestjs/common'

import type { BlockReasonResponseDto, UpdateBlockReasonDto } from '~/warehouse/application/dtos'
import { BlockReasonMapper } from '~/warehouse/application/mappers'
import { BlockReasonEntity } from '~/warehouse/domain/entities'
import { BlockReasonNotFoundException } from '~/warehouse/domain/exceptions'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class UpdateBlockReasonUseCase {
  constructor(private readonly blockReasonRepository: IBlockReasonRepository) {}

  async execute(id: number, dto: UpdateBlockReasonDto): Promise<BlockReasonResponseDto> {
    const existing = await this.blockReasonRepository.findById(id)

    if (!existing) {
      throw new BlockReasonNotFoundException(id)
    }

    const updated = new BlockReasonEntity(
      existing.id,
      dto.code ?? existing.code,
      dto.name ?? existing.name,
      dto.description !== undefined ? dto.description : existing.description,
      dto.permanent ?? existing.permanent,
      existing.createdAt,
      new Date()
    )

    const result = await this.blockReasonRepository.update(updated)

    return BlockReasonMapper.toResponseDto(result)
  }
}
