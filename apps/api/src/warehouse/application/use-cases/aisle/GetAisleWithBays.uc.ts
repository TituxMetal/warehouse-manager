import { Injectable } from '@nestjs/common'

import type { AisleResponseDto, BayResponseDto } from '~/warehouse/application/dtos'
import { AisleMapper, BayMapper } from '~/warehouse/application/mappers'
import { AisleNotFoundException } from '~/warehouse/domain/exceptions'
import type { IAisleRepository } from '~/warehouse/domain/repositories'

export interface AisleWithBaysResponseDto extends AisleResponseDto {
  bays: BayResponseDto[]
}

@Injectable()
export class GetAisleWithBaysUseCase {
  constructor(private readonly aisleRepository: IAisleRepository) {}

  async execute(id: number): Promise<AisleWithBaysResponseDto> {
    const aisleWithBays = await this.aisleRepository.findWithBays(id)

    if (!aisleWithBays) {
      throw new AisleNotFoundException(id)
    }

    const aisleDto = AisleMapper.toResponseDto(aisleWithBays)
    const baysDto = aisleWithBays.bays.map(bay => BayMapper.toResponseDto(bay))

    return { ...aisleDto, bays: baysDto }
  }
}
