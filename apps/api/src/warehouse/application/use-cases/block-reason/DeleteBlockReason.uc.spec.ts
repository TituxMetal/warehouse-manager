import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import {
  BlockReasonInUseException,
  BlockReasonNotFoundException
} from '~/warehouse/domain/exceptions'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

import { DeleteBlockReasonUseCase } from './DeleteBlockReason.uc'

describe('DeleteBlockReasonUseCase', () => {
  let useCase: DeleteBlockReasonUseCase
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
    useCase = new DeleteBlockReasonUseCase(
      mockBlockReasonRepository as unknown as IBlockReasonRepository
    )
  })

  describe('execute', () => {
    it('should delete block reason when exists and not in use', async () => {
      mockBlockReasonRepository.exists.mockResolvedValue(true)
      mockBlockReasonRepository.isInUse.mockResolvedValue(false)
      mockBlockReasonRepository.delete.mockResolvedValue(undefined)

      await useCase.execute(1)

      expect(mockBlockReasonRepository.exists).toHaveBeenCalledWith(1)
      expect(mockBlockReasonRepository.isInUse).toHaveBeenCalledWith(1)
      expect(mockBlockReasonRepository.delete).toHaveBeenCalledWith(1)
    })

    it('should throw BlockReasonNotFoundException when not found', async () => {
      mockBlockReasonRepository.exists.mockResolvedValue(false)

      await expect(useCase.execute(999)).rejects.toThrow(BlockReasonNotFoundException)
      expect(mockBlockReasonRepository.exists).toHaveBeenCalledWith(999)
      expect(mockBlockReasonRepository.isInUse).not.toHaveBeenCalled()
      expect(mockBlockReasonRepository.delete).not.toHaveBeenCalled()
    })

    it('should throw BlockReasonInUseException when in use', async () => {
      mockBlockReasonRepository.exists.mockResolvedValue(true)
      mockBlockReasonRepository.isInUse.mockResolvedValue(true)

      await expect(useCase.execute(1)).rejects.toThrow(BlockReasonInUseException)
      expect(mockBlockReasonRepository.exists).toHaveBeenCalledWith(1)
      expect(mockBlockReasonRepository.isInUse).toHaveBeenCalledWith(1)
      expect(mockBlockReasonRepository.delete).not.toHaveBeenCalled()
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockBlockReasonRepository.exists.mockRejectedValue(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
