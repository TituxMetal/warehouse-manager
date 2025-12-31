import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository } from '~/warehouse/domain/repositories'

import { DeleteCellUseCase } from './DeleteCell.uc'

describe('DeleteCellUseCase', () => {
  let useCase: DeleteCellUseCase
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
    useCase = new DeleteCellUseCase(mockCellRepository as unknown as ICellRepository)
  })

  describe('execute', () => {
    it('should delete cell when it exists', async () => {
      mockCellRepository.exists.mockResolvedValue(true)
      mockCellRepository.delete.mockResolvedValue(undefined)

      await useCase.execute(42)

      expect(mockCellRepository.exists).toHaveBeenCalledWith(42)
      expect(mockCellRepository.delete).toHaveBeenCalledWith(42)
    })

    it('should throw CellNotFoundException when cell does not exist', async () => {
      mockCellRepository.exists.mockResolvedValue(false)

      await expect(useCase.execute(999)).rejects.toThrow(CellNotFoundException)
      expect(mockCellRepository.delete).not.toHaveBeenCalled()
    })

    it('should handle repository errors on exists check', async () => {
      const error = new Error('Database error')
      mockCellRepository.exists.mockRejectedValue(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })

    it('should handle repository errors on delete', async () => {
      mockCellRepository.exists.mockResolvedValue(true)
      const error = new Error('Database error')
      mockCellRepository.delete.mockRejectedValue(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
