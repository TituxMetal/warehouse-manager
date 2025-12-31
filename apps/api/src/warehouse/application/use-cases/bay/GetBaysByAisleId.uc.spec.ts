import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { BayEntity } from '~/warehouse/domain/entities'
import type { IBayRepository } from '~/warehouse/domain/repositories'

import { GetBaysByAisleIdUseCase } from './GetBaysByAisleId.uc'

const createTestBayEntity = (overrides?: Partial<BayEntity>) =>
  Object.assign(
    new BayEntity(
      overrides?.id ?? 1,
      overrides?.number ?? 1,
      overrides?.width ?? 4,
      overrides?.aisleId ?? 1,
      overrides?.createdAt ?? new Date('2025-01-01'),
      overrides?.updatedAt ?? new Date('2025-01-02')
    ),
    overrides
  )

describe('GetBaysByAisleIdUseCase', () => {
  let useCase: GetBaysByAisleIdUseCase
  let mockBayRepository: {
    findById: Mock<IBayRepository['findById']>
    findByAisleId: Mock<IBayRepository['findByAisleId']>
    findWithLocations: Mock<IBayRepository['findWithLocations']>
    create: Mock<IBayRepository['create']>
    update: Mock<IBayRepository['update']>
    delete: Mock<IBayRepository['delete']>
  }

  beforeEach(() => {
    mockBayRepository = {
      findById: mock(() => {}) as unknown as Mock<IBayRepository['findById']>,
      findByAisleId: mock(() => {}) as unknown as Mock<IBayRepository['findByAisleId']>,
      findWithLocations: mock(() => {}) as unknown as Mock<IBayRepository['findWithLocations']>,
      create: mock(() => {}) as unknown as Mock<IBayRepository['create']>,
      update: mock(() => {}) as unknown as Mock<IBayRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IBayRepository['delete']>
    }
    useCase = new GetBaysByAisleIdUseCase(mockBayRepository as unknown as IBayRepository)
  })

  describe('execute', () => {
    it('should return bays for an aisle', async () => {
      const aisleId = 1
      const bay1 = createTestBayEntity({ id: 1, aisleId })
      const bay2 = createTestBayEntity({ id: 2, aisleId })

      mockBayRepository.findByAisleId.mockResolvedValueOnce([bay1, bay2])

      const result = await useCase.execute(aisleId)

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no bays exist', async () => {
      const aisleId = 999

      mockBayRepository.findByAisleId.mockResolvedValueOnce([])

      const result = await useCase.execute(aisleId)

      expect(result).toEqual([])
    })

    it('should handle repository errors', async () => {
      const aisleId = 1
      const error = new Error('Database error')

      mockBayRepository.findByAisleId.mockRejectedValueOnce(error)

      await expect(useCase.execute(aisleId)).rejects.toThrow(error)
    })
  })
})
