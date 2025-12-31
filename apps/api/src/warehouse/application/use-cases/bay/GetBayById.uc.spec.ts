import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { BayMapper } from '~/warehouse/application/mappers'
import { BayEntity } from '~/warehouse/domain/entities'
import type { IBayRepository } from '~/warehouse/domain/repositories'

import { GetBayByIdUseCase } from './GetBayById.uc'

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

describe('GetBayByIdUseCase', () => {
  let useCase: GetBayByIdUseCase
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
    useCase = new GetBayByIdUseCase(mockBayRepository as unknown as IBayRepository)
  })

  describe('execute', () => {
    it('should return bay when found', async () => {
      const bayId = 1
      const bayEntity = createTestBayEntity({ id: bayId })

      mockBayRepository.findById.mockResolvedValueOnce(bayEntity)

      const result = await useCase.execute(bayId)

      expect(mockBayRepository.findById).toHaveBeenCalledWith(bayId)
      expect(result).toEqual(BayMapper.toResponseDto(bayEntity))
    })

    it('should throw BayNotFoundException when not found', async () => {
      const bayId = 999

      mockBayRepository.findById.mockResolvedValueOnce(null)

      await expect(useCase.execute(bayId)).rejects.toThrowError(`Bay not found: ${bayId}`)

      expect(mockBayRepository.findById).toHaveBeenCalledWith(bayId)
    })

    it('should handle repository errors', async () => {
      const bayId = 1
      const errorMessage = 'Database error'

      mockBayRepository.findById.mockRejectedValueOnce(new Error(errorMessage))

      await expect(useCase.execute(bayId)).rejects.toThrowError(errorMessage)

      expect(mockBayRepository.findById).toHaveBeenCalledWith(bayId)
    })
  })
})
