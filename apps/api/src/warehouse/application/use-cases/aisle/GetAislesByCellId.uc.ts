import { Injectable } from '@nestjs/common'

import type { AisleResponseDto } from '~/warehouse/application/dtos'
import { AisleMapper } from '~/warehouse/application/mappers'
import type { IAisleRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetAislesByCellIdUseCase {
  constructor(private readonly aisleRepository: IAisleRepository) {}

  async execute(cellId: number): Promise<AisleResponseDto[]> {
    const aisles = await this.aisleRepository.findByCellId(cellId)

    return aisles.map(aisle => AisleMapper.toResponseDto(aisle))
  }
}
