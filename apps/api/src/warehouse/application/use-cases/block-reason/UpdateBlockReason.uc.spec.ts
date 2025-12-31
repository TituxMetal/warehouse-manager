import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import type { UpdateBlockReasonDto } from '~/warehouse/application/dtos'
import { BlockReasonMapper } from '~/warehouse/application/mappers'
import { BlockReasonEntity } from '~/warehouse/domain/entities'
import { BlockReasonNotFoundException } from '~/warehouse/domain/exceptions'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

import { UpdateBlockReasonUseCase } from './UpdateBlockReason.uc'

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

describe('UpdateBlockReasonUseCase', () => {
  let useCase: UpdateBlockReasonUseCase
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
    useCase = new UpdateBlockReasonUseCase(
      mockBlockReasonRepository as unknown as IBlockReasonRepository
    )
  })

  describe('execute', () => {
    it('should update block reason with partial fields', async () => {
      const existing = createTestBlockReasonEntity({ id: 1, name: 'Old Name' })
      const dto: UpdateBlockReasonDto = { name: 'New Name' }
      const updated = createTestBlockReasonEntity({ id: 1, name: 'New Name' })

      mockBlockReasonRepository.findById.mockResolvedValue(existing)
      mockBlockReasonRepository.update.mockResolvedValue(updated)

      const result = await useCase.execute(1, dto)

      expect(mockBlockReasonRepository.findById).toHaveBeenCalledWith(1)
      expect(mockBlockReasonRepository.update).toHaveBeenCalled()
      expect(result).toEqual(BlockReasonMapper.toResponseDto(updated))
    })

    it('should update all fields when provided', async () => {
      const existing = createTestBlockReasonEntity({ id: 1 })
      const dto: UpdateBlockReasonDto = {
        code: 'BR9999',
        name: 'Updated Name',
        description: 'Updated description',
        permanent: true
      }
      const updated = createTestBlockReasonEntity({
        id: 1,
        code: 'BR9999',
        name: 'Updated Name',
        description: 'Updated description',
        permanent: true
      })

      mockBlockReasonRepository.findById.mockResolvedValue(existing)
      mockBlockReasonRepository.update.mockResolvedValue(updated)

      const result = await useCase.execute(1, dto)

      expect(result).toEqual(BlockReasonMapper.toResponseDto(updated))
    })

    it('should throw BlockReasonNotFoundException when not found', async () => {
      const dto: UpdateBlockReasonDto = { name: 'New Name' }
      mockBlockReasonRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute(999, dto)).rejects.toThrow(BlockReasonNotFoundException)
      expect(mockBlockReasonRepository.findById).toHaveBeenCalledWith(999)
      expect(mockBlockReasonRepository.update).not.toHaveBeenCalled()
    })

    it('should handle repository errors', async () => {
      const existing = createTestBlockReasonEntity({ id: 1 })
      const dto: UpdateBlockReasonDto = { name: 'New Name' }
      const error = new Error('Database error')

      mockBlockReasonRepository.findById.mockResolvedValue(existing)
      mockBlockReasonRepository.update.mockRejectedValue(error)

      await expect(useCase.execute(1, dto)).rejects.toThrow(error)
    })
  })
})
