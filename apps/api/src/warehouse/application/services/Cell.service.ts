import { Injectable } from '@nestjs/common'

import type { CellResponseDto } from '~/warehouse/application/dtos'
import type {
  CellStatisticsDto,
  CellWithAislesResponseDto
} from '~/warehouse/application/use-cases/cell'
import {
  DeleteCellUseCase,
  GetAllCellsUseCase,
  GetCellByIdUseCase,
  GetCellByNumberUseCase,
  GetCellStatisticsUseCase,
  GetCellWithAislesUseCase
} from '~/warehouse/application/use-cases/cell'

@Injectable()
export class CellService {
  constructor(
    private readonly getAllCellsUseCase: GetAllCellsUseCase,
    private readonly getCellByIdUseCase: GetCellByIdUseCase,
    private readonly getCellByNumberUseCase: GetCellByNumberUseCase,
    private readonly getCellWithAislesUseCase: GetCellWithAislesUseCase,
    private readonly getCellStatisticsUseCase: GetCellStatisticsUseCase,
    private readonly deleteCellUseCase: DeleteCellUseCase
  ) {}

  async getAll(): Promise<CellResponseDto[]> {
    return this.getAllCellsUseCase.execute()
  }

  async getById(id: number): Promise<CellResponseDto> {
    return this.getCellByIdUseCase.execute(id)
  }

  async getByNumber(number: number): Promise<CellResponseDto> {
    return this.getCellByNumberUseCase.execute(number)
  }

  async getWithAisles(id: number): Promise<CellWithAislesResponseDto> {
    return this.getCellWithAislesUseCase.execute(id)
  }

  async getStatistics(id: number): Promise<CellStatisticsDto> {
    return this.getCellStatisticsUseCase.execute(id)
  }

  async delete(id: number): Promise<void> {
    return this.deleteCellUseCase.execute(id)
  }
}
