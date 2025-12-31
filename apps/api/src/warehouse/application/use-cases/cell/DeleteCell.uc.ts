import { Injectable } from '@nestjs/common'

import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository } from '~/warehouse/domain/repositories'

@Injectable()
export class DeleteCellUseCase {
  constructor(private readonly cellRepository: ICellRepository) {}

  async execute(id: number): Promise<void> {
    const exists = await this.cellRepository.exists(id)

    if (!exists) {
      throw new CellNotFoundException(id)
    }

    await this.cellRepository.delete(id)
  }
}
