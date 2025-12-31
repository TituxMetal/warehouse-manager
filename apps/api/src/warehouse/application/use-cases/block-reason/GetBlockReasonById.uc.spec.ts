import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { BlockReasonMapper } from '~/warehouse/application/mappers'
import { BlockReasonEntity } from '~/warehouse/domain/entities'
import { BlockReasonNotFoundException } from '~/warehouse/domain/exceptions'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

import { GetBlockReasonByIdUseCase } from './GetBlockReasonById.uc'

const createTestBlockReasonEntity = (overrides?: Partial<BlockReasonEntity>) =>
  new BlockReasonEntity(
    overrides?.id ?? 1,
    overrides?.code ?? 'BR0001',
    overrides?.name ?? 'Test Block Reason',
    overrides?.description ?? 'Test description',
    overrides?.permanent ?? false,
    overrides?.createdAt ?? new Date('2025-01-01'),
    overrides?.updatedAt ?? new Date('2025-01-02')
  )

describe('GetBlockReasonByIdUseCase', () => {
  let useCase: GetBlockReasonByIdUseCase
  let mockBlockReasonRepository: {
    findById: Mock<IBlockReasonRepository['findById']>
    findByCode: Mock<IBlockReasonRepository['findByCode']>
    findAll: Mock<IBlockReasonRepository['findAll']>
    create: Mock<IBlockReasonRepository['create']>
    update: Mock<IBlockReasonRepository['update']>
    delete: Mock<IBlockReasonRepository['delete']>
    exists: Mock<IBlockReasonRepository['exists']>
    isInUse: Mock<IBlockReasonRepository['isInUse']>
  }

  beforeEach(() => {
    mockBlockReasonRepository = {
      findById: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findById']>,
      findByCode: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findByCode']>,
      findAll: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findAll']>,
      create: mock(() => {}) as unknown as Mock<IBlockReasonRepository['create']>,
      update: mock(() => {}) as unknown as Mock<IBlockReasonRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IBlockReasonRepository['delete']>,
      exists: mock(() => {}) as unknown as Mock<IBlockReasonRepository['exists']>,
      isInUse: mock(() => {}) as unknown as Mock<IBlockReasonRepository['isInUse']>
    }
    useCase = new GetBlockReasonByIdUseCase(
      mockBlockReasonRepository as unknown as IBlockReasonRepository
    )
  })

  describe('execute', () => {
    it('should return block reason when found', async () => {
      const blockReason = createTestBlockReasonEntity({ id: 42, name: 'Concrete Pillar' })
      mockBlockReasonRepository.findById.mockResolvedValue(blockReason)

      const result = await useCase.execute(42)

      expect(mockBlockReasonRepository.findById).toHaveBeenCalledWith(42)
      expect(result).toEqual(BlockReasonMapper.toResponseDto(blockReason))
    })

    it('should throw BlockReasonNotFoundException when not found', async () => {
      mockBlockReasonRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute(999)).rejects.toThrow(BlockReasonNotFoundException)
      expect(mockBlockReasonRepository.findById).toHaveBeenCalledWith(999)
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockBlockReasonRepository.findById.mockRejectedValue(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
