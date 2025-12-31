import { Injectable } from '@nestjs/common'

import type { BayResponseDto } from '~/warehouse/application/dtos'
import { BayMapper } from '~/warehouse/application/mappers'
import type { IBayRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetBaysByAisleIdUseCase {
  constructor(private readonly bayRepository: IBayRepository) {}

  async execute(aisleId: number): Promise<BayResponseDto[]> {
    const bays = await this.bayRepository.findByAisleId(aisleId)

    return bays.map(bay => BayMapper.toResponseDto(bay))
  }
}
