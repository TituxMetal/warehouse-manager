import { Injectable } from '@nestjs/common'

import type { CellResponseDto } from '~/warehouse/application/dtos'
import { CellMapper } from '~/warehouse/application/mappers'
import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetCellByIdUseCase {
  constructor(private readonly cellRepository: ICellRepository) {}

  async execute(id: number): Promise<CellResponseDto> {
    const cell = await this.cellRepository.findById(id)

    if (!cell) {
      throw new CellNotFoundException(id)
    }

    return CellMapper.toResponseDto(cell)
  }
}
