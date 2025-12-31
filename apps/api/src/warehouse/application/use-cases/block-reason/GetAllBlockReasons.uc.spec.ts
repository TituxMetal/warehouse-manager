import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { BlockReasonMapper } from '~/warehouse/application/mappers'
import { BlockReasonEntity } from '~/warehouse/domain/entities'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

import { GetAllBlockReasonsUseCase } from './GetAllBlockReasons.uc'

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

describe('GetAllBlockReasonsUseCase', () => {
  let useCase: GetAllBlockReasonsUseCase
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
    useCase = new GetAllBlockReasonsUseCase(
      mockBlockReasonRepository as unknown as IBlockReasonRepository
    )
  })

  describe('execute', () => {
    it('should return all block reasons', async () => {
      const blockReasons = [
        createTestBlockReasonEntity({ id: 1, code: 'BR0001', name: 'Pillar' }),
        createTestBlockReasonEntity({ id: 2, code: 'BR0002', name: 'Fire Hose' })
      ]
      mockBlockReasonRepository.findAll.mockResolvedValue(blockReasons)

      const result = await useCase.execute()

      expect(mockBlockReasonRepository.findAll).toHaveBeenCalled()
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(BlockReasonMapper.toResponseDto(blockReasons[0]))
      expect(result[1]).toEqual(BlockReasonMapper.toResponseDto(blockReasons[1]))
    })

    it('should return empty array when no block reasons exist', async () => {
      mockBlockReasonRepository.findAll.mockResolvedValue([])

      const result = await useCase.execute()

      expect(mockBlockReasonRepository.findAll).toHaveBeenCalled()
      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockBlockReasonRepository.findAll.mockRejectedValue(error)

      await expect(useCase.execute()).rejects.toThrow(error)
    })
  })
})
