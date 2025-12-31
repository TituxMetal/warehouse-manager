import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { AisleEntity } from '~/warehouse/domain/entities'
import type { IAisleRepository } from '~/warehouse/domain/repositories'
import { AisleValueObject } from '~/warehouse/domain/value-objects'

import { GetAislesByCellIdUseCase } from './GetAislesByCellId.uc'

const createTestAisleEntity = (overrides: Partial<AisleEntity>) =>
  Object.assign(
    new AisleEntity(
      overrides.id ?? 1,
      overrides.number ?? new AisleValueObject(1),
      overrides.isOdd ?? true,
      overrides.cellId ?? 1,
      overrides.createdAt ?? new Date('2026-01-01'),
      overrides.updatedAt ?? new Date('2026-01-02')
    ),
    overrides
  )

describe('GetAislesByCellIdUseCase', () => {
  let useCase: GetAislesByCellIdUseCase
  let mockAisleRepository: {
    findById: Mock<IAisleRepository['findById']>
    findByCellId: Mock<IAisleRepository['findByCellId']>
    findWithBays: Mock<IAisleRepository['findWithBays']>
    findWithLocations: Mock<IAisleRepository['findWithLocations']>
    create: Mock<IAisleRepository['create']>
    update: Mock<IAisleRepository['update']>
    delete: Mock<IAisleRepository['delete']>
  }

  beforeEach(() => {
    mockAisleRepository = {
      findById: mock(() => {}) as unknown as Mock<IAisleRepository['findById']>,
      findByCellId: mock(() => {}) as unknown as Mock<IAisleRepository['findByCellId']>,
      findWithBays: mock(() => {}) as unknown as Mock<IAisleRepository['findWithBays']>,
      findWithLocations: mock(() => {}) as unknown as Mock<IAisleRepository['findWithLocations']>,
      create: mock(() => {}) as unknown as Mock<IAisleRepository['create']>,
      update: mock(() => {}) as unknown as Mock<IAisleRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IAisleRepository['delete']>
    }
    useCase = new GetAislesByCellIdUseCase(mockAisleRepository as unknown as IAisleRepository)
  })

  describe('execute', () => {
    it('should return aisles for a cell', async () => {
      const cellId = 1
      const aisle1 = createTestAisleEntity({ id: 1, cellId })
      const aisle2 = createTestAisleEntity({ id: 2, cellId })

      mockAisleRepository.findByCellId.mockResolvedValueOnce([aisle1, aisle2])

      const result = await useCase.execute(cellId)

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no aisles exist', async () => {
      const cellId = 999

      mockAisleRepository.findByCellId.mockResolvedValueOnce([])

      const result = await useCase.execute(cellId)

      expect(result).toEqual([])
    })

    it('should handle repository errors', async () => {
      const cellId = 1
      const error = new Error('Database error')

      mockAisleRepository.findByCellId.mockRejectedValueOnce(error)

      await expect(useCase.execute(cellId)).rejects.toThrow(error)
    })
  })
})
