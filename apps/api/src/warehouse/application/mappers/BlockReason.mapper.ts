// TODO(human): Implement BlockReasonMapper
//
// Method: static toResponseDto(entity: BlockReasonEntity): BlockReasonResponseDto
//
// Computed: dto.displayName = entity.getDisplayName()

import type { BlockReasonEntity } from '~/warehouse/domain/entities'

import { BlockReasonResponseDto } from '../dtos'

// Direct fields: id, code, name, description, permanent, createdAt, updatedAt
export class BlockReasonMapper {
  static toResponseDto(entity: BlockReasonEntity): BlockReasonResponseDto {
    const dto: BlockReasonResponseDto = {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      permanent: entity.permanent,
      displayName: entity.getDisplayName(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }

    return Object.assign(new BlockReasonResponseDto(), dto)
  }
}
