import { Injectable } from '@nestjs/common'

import type { BlockLocationDto, LocationResponseDto } from '~/warehouse/application/dtos'
import { LocationMapper } from '~/warehouse/application/mappers'
import {
  BlockReasonNotFoundException,
  LocationAlreadyBlockedException,
  LocationNotFoundException
} from '~/warehouse/domain/exceptions'
import type { IBlockReasonRepository, ILocationRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class BlockLocationUseCase {
  constructor(
    private readonly locationRepository: ILocationRepository,
    private readonly blockReasonRepository: IBlockReasonRepository
  ) {}

  async execute(locationId: number, dto: BlockLocationDto): Promise<LocationResponseDto> {
    const location = await this.locationRepository.findById(locationId)

    if (!location) {
      throw new LocationNotFoundException(locationId)
    }

    if (location.isBlocked()) {
      throw new LocationAlreadyBlockedException(locationId)
    }

    const blockReason = await this.blockReasonRepository.findById(dto.blockReasonId)

    if (!blockReason) {
      throw new BlockReasonNotFoundException(dto.blockReasonId)
    }

    location.block(dto.blockReasonId)

    const updatedLocation = await this.locationRepository.update(location)

    return LocationMapper.toResponseDto(updatedLocation)
  }
}
