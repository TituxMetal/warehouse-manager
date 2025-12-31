import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { CellEntity } from '~/warehouse/domain/entities'
import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository, ILocationRepository } from '~/warehouse/domain/repositories'
import { CellValueObject } from '~/warehouse/domain/value-objects'

import { GetCellStatisticsUseCase } from './GetCellStatistics.uc'

const createTestCellEntity = (overrides?: {
  id?: number
  number?: number
  aislesCount?: number
  locationsPerAisle?: number
  levelsPerLocation?: number
  createdAt?: Date
  updatedAt?: Date
}) =>
  new CellEntity(
    overrides?.id ?? 1,
    new CellValueObject(overrides?.number ?? 4),
    overrides?.aislesCount ?? 20,
    overrides?.locationsPerAisle ?? 200,
    overrides?.levelsPerLocation ?? 6,
    overrides?.createdAt ?? new Date('2025-01-01'),
    overrides?.updatedAt ?? new Date('2025-01-02')
  )

describe('GetCellStatisticsUseCase', () => {
  let useCase: GetCellStatisticsUseCase
  let mockCellRepository: {
    findById: Mock<ICellRepository['findById']>
    findByNumber: Mock<ICellRepository['findByNumber']>
    findAll: Mock<ICellRepository['findAll']>
    findWithAisles: Mock<ICellRepository['findWithAisles']>
    create: Mock<ICellRepository['create']>
    update: Mock<ICellRepository['update']>
    delete: Mock<ICellRepository['delete']>
    exists: Mock<ICellRepository['exists']>
  }
  let mockLocationRepository: {
    findById: Mock<ILocationRepository['findById']>
    findByBayId: Mock<ILocationRepository['findByBayId']>
    findByAisleId: Mock<ILocationRepository['findByAisleId']>
    findPickingLocations: Mock<ILocationRepository['findPickingLocations']>
    findAvailableLocations: Mock<ILocationRepository['findAvailableLocations']>
    findBlockedLocations: Mock<ILocationRepository['findBlockedLocations']>
    create: Mock<ILocationRepository['create']>
    update: Mock<ILocationRepository['update']>
    delete: Mock<ILocationRepository['delete']>
  }

  beforeEach(() => {
    mockCellRepository = {
      findById: mock(() => {}) as unknown as Mock<ICellRepository['findById']>,
      findByNumber: mock(() => {}) as unknown as Mock<ICellRepository['findByNumber']>,
      findAll: mock(() => {}) as unknown as Mock<ICellRepository['findAll']>,
      findWithAisles: mock(() => {}) as unknown as Mock<ICellRepository['findWithAisles']>,
      create: mock(() => {}) as unknown as Mock<ICellRepository['create']>,
      update: mock(() => {}) as unknown as Mock<ICellRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<ICellRepository['delete']>,
      exists: mock(() => {}) as unknown as Mock<ICellRepository['exists']>
    }
    mockLocationRepository = {
      findById: mock(() => {}) as unknown as Mock<ILocationRepository['findById']>,
      findByBayId: mock(() => {}) as unknown as Mock<ILocationRepository['findByBayId']>,
      findByAisleId: mock(() => {}) as unknown as Mock<ILocationRepository['findByAisleId']>,
      findPickingLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findPickingLocations']
      >,
      findAvailableLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findAvailableLocations']
      >,
      findBlockedLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findBlockedLocations']
      >,
      create: mock(() => {}) as unknown as Mock<ILocationRepository['create']>,
      update: mock(() => {}) as unknown as Mock<ILocationRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<ILocationRepository['delete']>
    }
    useCase = new GetCellStatisticsUseCase(
      mockCellRepository as unknown as ICellRepository,
      mockLocationRepository as unknown as ILocationRepository
    )
  })

  describe('execute', () => {
    it('should return cell statistics with placeholder values', async () => {
      const cell = createTestCellEntity({
        id: 1,
        aislesCount: 10,
        locationsPerAisle: 100,
        levelsPerLocation: 5
      })
      mockCellRepository.findById.mockResolvedValue(cell)

      const result = await useCase.execute(1)

      expect(mockCellRepository.findById).toHaveBeenCalledWith(1)
      expect(result.cellId).toBe(1)
      expect(result.totalLocations).toBe(cell.getTotalLocations())
      // Placeholder values until TODO(human) is implemented
      expect(result.availableLocations).toBe(0)
      expect(result.occupiedLocations).toBe(0)
      expect(result.blockedLocations).toBe(0)
      expect(result.pickingLocations).toBe(0)
    })

    it('should throw CellNotFoundException when cell not found', async () => {
      mockCellRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute(999)).rejects.toThrow(CellNotFoundException)
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockCellRepository.findById.mockRejectedValue(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
