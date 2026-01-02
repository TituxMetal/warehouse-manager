import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { AisleEntity, BayEntity } from '~/warehouse/domain/entities'
import type { IAisleRepository } from '~/warehouse/domain/repositories'
import { AisleValueObject } from '~/warehouse/domain/value-objects'

import { GetAisleWithBaysUseCase } from './GetAisleWithBays.uc'

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

const createTestBayEntity = (overrides: Partial<BayEntity>) =>
  Object.assign(
    new BayEntity(
      overrides.id ?? 1,
      overrides.number ?? 1,
      overrides.width ?? 4,
      overrides.startPosition ?? 0,
      overrides.aisleId ?? 1,
      overrides.createdAt ?? new Date('2026-01-01'),
      overrides.updatedAt ?? new Date('2026-01-02')
    ),
    overrides
  )

describe('GetAisleWithBaysUseCase', () => {
  let useCase: GetAisleWithBaysUseCase
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
    useCase = new GetAisleWithBaysUseCase(mockAisleRepository as unknown as IAisleRepository)
  })

  describe('execute', () => {
    it('should return aisle with its bays', async () => {
      const aisle = createTestAisleEntity({ id: 1 })
      const bay1 = createTestBayEntity({ id: 1, aisleId: 1 })
      const bay2 = createTestBayEntity({ id: 2, aisleId: 1 })
      const aisleWithBays = Object.assign(aisle, { bays: [bay1, bay2] })

      mockAisleRepository.findWithBays.mockResolvedValueOnce(aisleWithBays)

      const result = await useCase.execute(1)

      expect(result).toHaveProperty('id', aisle.id)
      expect(result).toHaveProperty('number', aisle.number.value)
      expect(result).toHaveProperty('isOdd', aisle.isOdd)
      expect(result).toHaveProperty('bays')
      expect(result.bays).toHaveLength(2)
      expect(result.bays[0]).toHaveProperty('id', bay1.id)
      expect(result.bays[1]).toHaveProperty('id', bay2.id)
    })

    it('should return aisle with empty bays array', async () => {
      const aisle = createTestAisleEntity({ id: 2 })
      const aisleWithBays = Object.assign(aisle, { bays: [] })

      mockAisleRepository.findWithBays.mockResolvedValueOnce(aisleWithBays)

      const result = await useCase.execute(2)

      expect(result).toHaveProperty('id', aisle.id)
      expect(result).toHaveProperty('number', aisle.number.value)
      expect(result).toHaveProperty('isOdd', aisle.isOdd)
      expect(result).toHaveProperty('bays')
      expect(result.bays).toHaveLength(0)
    })

    it('should throw AisleNotFoundException when not found', async () => {
      mockAisleRepository.findWithBays.mockResolvedValueOnce(null)

      await expect(useCase.execute(999)).rejects.toThrow('Aisle not found: 999')
    })

    it('should handle repository errors', async () => {
      const cellId = 1
      const error = new Error('Database error')

      mockAisleRepository.findWithBays.mockRejectedValueOnce(error)

      await expect(useCase.execute(cellId)).rejects.toThrow(error)
    })
  })
})
