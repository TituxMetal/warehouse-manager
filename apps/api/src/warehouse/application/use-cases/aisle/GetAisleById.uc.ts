import { Injectable } from '@nestjs/common'

import type { AisleResponseDto } from '~/warehouse/application/dtos'
import { AisleMapper } from '~/warehouse/application/mappers'
import { AisleNotFoundException } from '~/warehouse/domain/exceptions'
import type { IAisleRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetAisleByIdUseCase {
  constructor(private readonly aisleRepository: IAisleRepository) {}

  async execute(id: number): Promise<AisleResponseDto> {
    const aisle = await this.aisleRepository.findById(id)

    if (!aisle) {
      throw new AisleNotFoundException(id)
    }

    return AisleMapper.toResponseDto(aisle)
  }
}
