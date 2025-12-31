import { Injectable } from '@nestjs/common'

import type { BayResponseDto, LocationResponseDto } from '~/warehouse/application/dtos'
import { BayMapper, LocationMapper } from '~/warehouse/application/mappers'
import { BayNotFoundException } from '~/warehouse/domain/exceptions'
import type { IBayRepository } from '~/warehouse/domain/repositories'

export interface BayWithLocationsResponseDto extends BayResponseDto {
  locations: LocationResponseDto[]
}

@Injectable()
export class GetBayWithLocationsUseCase {
  constructor(private readonly bayRepository: IBayRepository) {}

  async execute(id: number): Promise<BayWithLocationsResponseDto> {
    const bayWithLocations = await this.bayRepository.findWithLocations(id)

    if (!bayWithLocations) {
      throw new BayNotFoundException(id)
    }

    const bayDto = BayMapper.toResponseDto(bayWithLocations)
    const locationsDto = bayWithLocations.locations.map(location =>
      LocationMapper.toResponseDto(location)
    )

    return { ...bayDto, locations: locationsDto }
  }
}
