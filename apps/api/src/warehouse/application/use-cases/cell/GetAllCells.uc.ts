import { Injectable } from '@nestjs/common'

import type { CellResponseDto } from '~/warehouse/application/dtos'
import { CellMapper } from '~/warehouse/application/mappers'
import type { ICellRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetAllCellsUseCase {
  constructor(private readonly cellRepository: ICellRepository) {}

  async execute(): Promise<CellResponseDto[]> {
    const cells = await this.cellRepository.findAll()

    return cells.map(entity => CellMapper.toResponseDto(entity))
  }
}
