import { Injectable } from '@nestjs/common'

import type { LocationResponseDto } from '~/warehouse/application/dtos'
import { LocationMapper } from '~/warehouse/application/mappers'
import { LocationNotFoundException } from '~/warehouse/domain/exceptions'
import type { ILocationRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetLocationByIdUseCase {
  constructor(private readonly locationRepository: ILocationRepository) {}

  async execute(id: number): Promise<LocationResponseDto> {
    const location = await this.locationRepository.findById(id)

    if (!location) {
      throw new LocationNotFoundException(id)
    }

    return LocationMapper.toResponseDto(location)
  }
}
