import { Injectable } from '@nestjs/common'

import type { BayResponseDto } from '~/warehouse/application/dtos'
import { BayMapper } from '~/warehouse/application/mappers'
import { BayNotFoundException } from '~/warehouse/domain/exceptions'
import type { IBayRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetBayByIdUseCase {
  constructor(private readonly bayRepository: IBayRepository) {}

  async execute(id: number): Promise<BayResponseDto> {
    const bay = await this.bayRepository.findById(id)

    if (!bay) {
      throw new BayNotFoundException(id)
    }

    return BayMapper.toResponseDto(bay)
  }
}
