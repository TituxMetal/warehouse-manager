import { Injectable } from '@nestjs/common'

import type { BlockReasonResponseDto, CreateBlockReasonDto } from '~/warehouse/application/dtos'
import { BlockReasonMapper } from '~/warehouse/application/mappers'
import { BlockReasonEntity } from '~/warehouse/domain/entities'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class CreateBlockReasonUseCase {
  constructor(private readonly blockReasonRepository: IBlockReasonRepository) {}

  async execute(dto: CreateBlockReasonDto): Promise<BlockReasonResponseDto> {
    // The non-null assertion (!) is safe here because class-validator ensures
    // these required fields are present before this code runs
    const blockReasonEntity = new BlockReasonEntity(
      0,
      dto.code!,
      dto.name!,
      dto.description ?? null,
      dto.permanent ?? false,
      new Date(),
      new Date()
    )

    const created = await this.blockReasonRepository.create(blockReasonEntity)

    return BlockReasonMapper.toResponseDto(created)
  }
}
