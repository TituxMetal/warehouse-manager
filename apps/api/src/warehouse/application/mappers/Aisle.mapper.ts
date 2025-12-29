import type { AisleEntity } from '~/warehouse/domain/entities'

import { AisleResponseDto } from '../dtos'

export class AisleMapper {
  static toResponseDto(entity: AisleEntity): AisleResponseDto {
    const dto: AisleResponseDto = {
      id: entity.id,
      number: entity.number.value,
      isOdd: entity.isOdd,
      cellId: entity.cellId,
      label: entity.getLabel(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }

    return Object.assign(new AisleResponseDto(), dto)
  }
}
