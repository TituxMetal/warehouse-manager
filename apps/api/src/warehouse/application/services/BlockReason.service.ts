import { Injectable } from '@nestjs/common'

import type {
  BlockReasonResponseDto,
  CreateBlockReasonDto,
  UpdateBlockReasonDto
} from '~/warehouse/application/dtos'
import {
  CreateBlockReasonUseCase,
  DeleteBlockReasonUseCase,
  GetAllBlockReasonsUseCase,
  GetBlockReasonByIdUseCase,
  UpdateBlockReasonUseCase
} from '~/warehouse/application/use-cases/block-reason'

@Injectable()
export class BlockReasonService {
  constructor(
    private readonly getAllBlockReasonsUseCase: GetAllBlockReasonsUseCase,
    private readonly getBlockReasonByIdUseCase: GetBlockReasonByIdUseCase,
    private readonly createBlockReasonUseCase: CreateBlockReasonUseCase,
    private readonly updateBlockReasonUseCase: UpdateBlockReasonUseCase,
    private readonly deleteBlockReasonUseCase: DeleteBlockReasonUseCase
  ) {}

  async getAll(): Promise<BlockReasonResponseDto[]> {
    return this.getAllBlockReasonsUseCase.execute()
  }

  async getById(id: number): Promise<BlockReasonResponseDto> {
    return this.getBlockReasonByIdUseCase.execute(id)
  }

  async create(dto: CreateBlockReasonDto): Promise<BlockReasonResponseDto> {
    return this.createBlockReasonUseCase.execute(dto)
  }

  async update(id: number, dto: UpdateBlockReasonDto): Promise<BlockReasonResponseDto> {
    return this.updateBlockReasonUseCase.execute(id, dto)
  }

  async delete(id: number): Promise<void> {
    return this.deleteBlockReasonUseCase.execute(id)
  }
}
