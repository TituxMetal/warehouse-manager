import { Injectable } from '@nestjs/common'

import type { LocationResponseDto } from '~/warehouse/application/dtos'
import { LocationMapper } from '~/warehouse/application/mappers'
import { LocationNotFoundException } from '~/warehouse/domain/exceptions'
import type { ILocationRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class UnblockLocationUseCase {
  constructor(private readonly locationRepository: ILocationRepository) {}

  async execute(locationId: number): Promise<LocationResponseDto> {
    const location = await this.locationRepository.findById(locationId)

    if (!location) {
      throw new LocationNotFoundException(locationId)
    }

    location.unblock()

    const updatedLocation = await this.locationRepository.update(location)

    return LocationMapper.toResponseDto(updatedLocation)
  }
}
