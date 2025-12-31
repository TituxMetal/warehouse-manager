import { Injectable } from '@nestjs/common'

import type { AisleResponseDto } from '~/warehouse/application/dtos'
import type {
  AisleWithBaysResponseDto,
  AisleWithLocationsResponseDto
} from '~/warehouse/application/use-cases/aisle'
import {
  GetAisleByIdUseCase,
  GetAislesByCellIdUseCase,
  GetAisleWithBaysUseCase,
  GetAisleWithLocationsUseCase
} from '~/warehouse/application/use-cases/aisle'

@Injectable()
export class AisleService {
  constructor(
    private readonly getAisleByIdUseCase: GetAisleByIdUseCase,
    private readonly getAislesByCellIdUseCase: GetAislesByCellIdUseCase,
    private readonly getAisleWithBaysUseCase: GetAisleWithBaysUseCase,
    private readonly getAisleWithLocationsUseCase: GetAisleWithLocationsUseCase
  ) {}

  async getById(id: number): Promise<AisleResponseDto> {
    return this.getAisleByIdUseCase.execute(id)
  }

  async getByCellId(cellId: number): Promise<AisleResponseDto[]> {
    return this.getAislesByCellIdUseCase.execute(cellId)
  }

  async getWithBays(id: number): Promise<AisleWithBaysResponseDto> {
    return this.getAisleWithBaysUseCase.execute(id)
  }

  async getWithLocations(id: number): Promise<AisleWithLocationsResponseDto> {
    return this.getAisleWithLocationsUseCase.execute(id)
  }
}
