import { Injectable } from '@nestjs/common'

import type { LocationResponseDto } from '~/warehouse/application/dtos'
import { LocationMapper } from '~/warehouse/application/mappers'
import type { ILocationRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class GetLocationsByBayIdUseCase {
  constructor(private readonly locationRepository: ILocationRepository) {}

  async execute(bayId: number): Promise<LocationResponseDto[]> {
    const locations = await this.locationRepository.findByBayId(bayId)

    return locations.map(location => LocationMapper.toResponseDto(location))
  }
}
