// TODO(human): Implement LocationMapper
//
// Method: static toResponseDto(entity: LocationEntity): LocationResponseDto
//
// Value Objects to extract:
//   - entity.position.value → dto.position
//   - entity.level.value → dto.level
//
// Computed booleans:
//   - dto.isPicking = entity.isPicking()
//   - dto.isBlocked = entity.isBlocked()
//   - dto.isAvailable = entity.isAvailable()
//

import type { LocationEntity } from '~/warehouse/domain/entities'

import { LocationResponseDto } from '../dtos'

// Direct fields: id, status, aisleId, bayId, blockReasonId, createdAt, updatedAt
export class LocationMapper {
  static toResponseDto(entity: LocationEntity): LocationResponseDto {
    const dto: LocationResponseDto = {
      id: entity.id,
      position: entity.position.value,
      level: entity.level.value,
      status: entity.status,
      aisleId: entity.aisleId,
      bayId: entity.bayId,
      blockReasonId: entity.blockReasonId,
      isPicking: entity.isPicking(),
      isBlocked: entity.isBlocked(),
      isAvailable: entity.isAvailable(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }

    return Object.assign(new LocationResponseDto(), dto)
  }
}
