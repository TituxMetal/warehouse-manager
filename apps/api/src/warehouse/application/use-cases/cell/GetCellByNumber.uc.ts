import { Injectable } from '@nestjs/common'

import type { CellResponseDto } from '~/warehouse/application/dtos'
import { CellMapper } from '~/warehouse/application/mappers'
import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository } from '~/warehouse/domain/repositories'
import { CellValueObject } from '~/warehouse/domain/value-objects'

@Injectable()
export class GetCellByNumberUseCase {
  constructor(private readonly cellRepository: ICellRepository) {}

  async execute(cellNumber: number): Promise<CellResponseDto> {
    const cellVO = new CellValueObject(cellNumber)
    const cell = await this.cellRepository.findByNumber(cellVO)

    if (!cell) {
      throw new CellNotFoundException(cellNumber)
    }

    return CellMapper.toResponseDto(cell)
  }
}
