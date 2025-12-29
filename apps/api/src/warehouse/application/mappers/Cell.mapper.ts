import type { CellEntity } from '~/warehouse/domain/entities'

import { CellResponseDto } from '../dtos'

export class CellMapper {
  static toResponseDto(entity: CellEntity): CellResponseDto {
    const dto: CellResponseDto = {
      id: entity.id,
      number: entity.number.value,
      totalLocations: entity.getTotalLocations(),
      aislesCount: entity.aislesCount,
      locationsPerAisle: entity.locationsPerAisle,
      levelsPerLocation: entity.levelsPerLocation,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }

    return Object.assign(new CellResponseDto(), dto)
  }
}
