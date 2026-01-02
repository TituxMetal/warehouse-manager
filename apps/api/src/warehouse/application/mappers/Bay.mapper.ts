import type { BayEntity } from '~/warehouse/domain/entities'

import { BayResponseDto } from '../dtos'

export class BayMapper {
  static toResponseDto(entity: BayEntity): BayResponseDto {
    const dto: BayResponseDto = {
      id: entity.id,
      number: entity.number,
      width: entity.width,
      startPosition: entity.startPosition,
      aisleId: entity.aisleId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }

    return Object.assign(new BayResponseDto(), dto)
  }
}
