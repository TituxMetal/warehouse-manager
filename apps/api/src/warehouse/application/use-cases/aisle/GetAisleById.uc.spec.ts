import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { AisleMapper } from '~/warehouse/application/mappers'
import { AisleEntity } from '~/warehouse/domain/entities'
import type { IAisleRepository } from '~/warehouse/domain/repositories'
import { AisleValueObject } from '~/warehouse/domain/value-objects'

import { GetAisleByIdUseCase } from './GetAisleById.uc'

const createTestAisleEntity = (overrides: Partial<AisleEntity>) =>
  Object.assign(
    new AisleEntity(
      overrides.id ?? 1,
      overrides.number ?? new AisleValueObject(1),
      overrides.isOdd ?? true,
      overrides.cellId ?? 1,
      overrides.createdAt ?? new Date('2025-01-01'),
      overrides.updatedAt ?? new Date('2025-01-02')
    ),
    overrides
  )

describe('GetAisleByIdUseCase', () => {
  let useCase: GetAisleByIdUseCase
  let mockAisleRepository: {
    findById: Mock<IAisleRepository['findById']>
    findByCellId: Mock<IAisleRepository['findByCellId']>
    findWithBays: Mock<IAisleRepository['findWithBays']>
    findWithLocations: Mock<IAisleRepository['findWithLocations']>
    create: Mock<IAisleRepository['create']>
    createMany: Mock<IAisleRepository['createMany']>
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
      createMany: mock(() => {}) as unknown as Mock<IAisleRepository['createMany']>,
      update: mock(() => {}) as unknown as Mock<IAisleRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IAisleRepository['delete']>
    }
    useCase = new GetAisleByIdUseCase(mockAisleRepository)
  })

  describe('execute', () => {
    it('should return aisle when found', async () => {
      const aisle = createTestAisleEntity({ id: 42 })

      mockAisleRepository.findById.mockResolvedValueOnce(aisle)

      const result = await useCase.execute(42)

      expect(result).toEqual(AisleMapper.toResponseDto(aisle))
      expect(mockAisleRepository.findById).toHaveBeenCalledWith(42)
    })

    it('should throw AisleNotFoundException when not found', async () => {
      mockAisleRepository.findById.mockResolvedValueOnce(null)

      await expect(useCase.execute(99)).rejects.toThrowError('Aisle not found: 99')

      expect(mockAisleRepository.findById).toHaveBeenCalledWith(99)
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')

      mockAisleRepository.findById.mockRejectedValue(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
