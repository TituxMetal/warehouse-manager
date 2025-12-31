import { Injectable } from '@nestjs/common'

import type { LocationResponseDto } from '~/warehouse/application/dtos'
import { LocationMapper } from '~/warehouse/application/mappers'
import type { ILocationRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetAvailableLocationsUseCase {
  constructor(private readonly locationRepository: ILocationRepository) {}

  async execute(): Promise<LocationResponseDto[]> {
    const locations = await this.locationRepository.findAvailableLocations()

    return locations.map(location => LocationMapper.toResponseDto(location))
  }
}
