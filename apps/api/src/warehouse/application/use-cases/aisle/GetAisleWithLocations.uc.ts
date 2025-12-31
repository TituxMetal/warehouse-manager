import { Injectable } from '@nestjs/common'

import type { AisleResponseDto, LocationResponseDto } from '~/warehouse/application/dtos'
import { AisleMapper, LocationMapper } from '~/warehouse/application/mappers'
import { AisleNotFoundException } from '~/warehouse/domain/exceptions'
import type { IAisleRepository } from '~/warehouse/domain/repositories'

export interface AisleWithLocationsResponseDto extends AisleResponseDto {
  locations: LocationResponseDto[]
}

@Injectable()
export class GetAisleWithLocationsUseCase {
  constructor(private readonly aisleRepository: IAisleRepository) {}

  async execute(id: number): Promise<AisleWithLocationsResponseDto> {
    const aisleWithLocations = await this.aisleRepository.findWithLocations(id)

    if (!aisleWithLocations) {
      throw new AisleNotFoundException(id)
    }

    const aisleDto = AisleMapper.toResponseDto(aisleWithLocations)
    const locationsDto = aisleWithLocations.locations.map(location =>
      LocationMapper.toResponseDto(location)
    )

    return { ...aisleDto, locations: locationsDto }
  }
}
