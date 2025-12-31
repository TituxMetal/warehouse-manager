import { Injectable } from '@nestjs/common'

import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository, ILocationRepository } from '~/warehouse/domain/repositories'

export interface CellStatisticsDto {
  cellId: number
  totalLocations: number
  availableLocations: number
  occupiedLocations: number
  blockedLocations: number
  pickingLocations: number
}

@Injectable()
export class GetCellStatisticsUseCase {
  constructor(
    private readonly cellRepository: ICellRepository,
    private readonly locationRepository: ILocationRepository
  ) {}

  async execute(cellId: number): Promise<CellStatisticsDto> {
    const cell = await this.cellRepository.findById(cellId)

    if (!cell) {
      throw new CellNotFoundException(cellId)
    }

    // TODO(human): Implement the statistics aggregation logic
    //
    // You have access to:
    // - cell.getTotalLocations() for theoretical total
    // - this.locationRepository methods for actual counts
    //
    // The challenge: ILocationRepository has findByAisleId but not findByCellId.
    // You'll need to think about how to get locations for a cell.
    //
    // Option A: Add a findByCellId method to ILocationRepository
    // Option B: Get all aisles for the cell, then get locations for each aisle
    // Option C: Use the existing findPickingLocations/findAvailable/findBlocked
    //           but filter by cell (if the entities have that info)
    //
    // For now, return placeholder values. We can implement the real
    // logic when we have the infrastructure layer ready.

    return {
      cellId: cell.id,
      totalLocations: cell.getTotalLocations(),
      availableLocations: 0,
      occupiedLocations: 0,
      blockedLocations: 0,
      pickingLocations: 0
    }
  }
}
