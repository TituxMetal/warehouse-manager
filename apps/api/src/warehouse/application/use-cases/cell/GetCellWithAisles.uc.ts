import { Injectable } from '@nestjs/common'

import type { AisleResponseDto, CellResponseDto } from '~/warehouse/application/dtos'
import { AisleMapper, CellMapper } from '~/warehouse/application/mappers'
import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository } from '~/warehouse/domain/repositories'

export interface CellWithAislesResponseDto extends CellResponseDto {
  aisles: AisleResponseDto[]
}

@Injectable()
export class GetCellWithAislesUseCase {
  constructor(private readonly cellRepository: ICellRepository) {}

  async execute(id: number): Promise<CellWithAislesResponseDto> {
    const cellWithAisles = await this.cellRepository.findWithAisles(id)

    if (!cellWithAisles) {
      throw new CellNotFoundException(id)
    }

    const cellDto = CellMapper.toResponseDto(cellWithAisles)
    const aislesDto = cellWithAisles.aisles.map(aisle => AisleMapper.toResponseDto(aisle))

    return {
      ...cellDto,
      aisles: aislesDto
    }
  }
}
