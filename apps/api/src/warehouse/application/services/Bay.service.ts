import { Injectable } from '@nestjs/common'

import type { BayResponseDto } from '~/warehouse/application/dtos'
import type { BayWithLocationsResponseDto } from '~/warehouse/application/use-cases/bay'
import {
  GetBayByIdUseCase,
  GetBaysByAisleIdUseCase,
  GetBayWithLocationsUseCase
} from '~/warehouse/application/use-cases/bay'

@Injectable()
export class BayService {
  constructor(
    private readonly getBayByIdUseCase: GetBayByIdUseCase,
    private readonly getBaysByAisleIdUseCase: GetBaysByAisleIdUseCase,
    private readonly getBayWithLocationsUseCase: GetBayWithLocationsUseCase
  ) {}

  async getById(id: number): Promise<BayResponseDto> {
    return this.getBayByIdUseCase.execute(id)
  }

  async getByAisleId(aisleId: number): Promise<BayResponseDto[]> {
    return this.getBaysByAisleIdUseCase.execute(aisleId)
  }

  async getWithLocations(id: number): Promise<BayWithLocationsResponseDto> {
    return this.getBayWithLocationsUseCase.execute(id)
  }
}
