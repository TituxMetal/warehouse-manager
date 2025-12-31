import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { CellMapper } from '~/warehouse/application/mappers'
import { CellEntity } from '~/warehouse/domain/entities'
import type { ICellRepository } from '~/warehouse/domain/repositories'
import { CellValueObject } from '~/warehouse/domain/value-objects'

import { GetAllCellsUseCase } from './GetAllCells.uc'

const createTestCellEntity = (overrides?: {
  id?: number
  number?: number
  aislesCount?: number
  locationsPerAisle?: number
  levelsPerLocation?: number
  createdAt?: Date
  updatedAt?: Date
}) =>
  new CellEntity(
    overrides?.id ?? 1,
    new CellValueObject(overrides?.number ?? 4),
    overrides?.aislesCount ?? 20,
    overrides?.locationsPerAisle ?? 200,
    overrides?.levelsPerLocation ?? 6,
    overrides?.createdAt ?? new Date('2025-01-01'),
    overrides?.updatedAt ?? new Date('2025-01-02')
  )

describe('GetAllCellsUseCase', () => {
  let useCase: GetAllCellsUseCase
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
    useCase = new GetAllCellsUseCase(mockCellRepository as unknown as ICellRepository)
  })

  describe('execute', () => {
    it('should return all cells', async () => {
      const cells = [
        createTestCellEntity({ id: 1, number: 4 }),
        createTestCellEntity({ id: 2, number: 5 })
      ]
      mockCellRepository.findAll.mockResolvedValue(cells)

      const result = await useCase.execute()

      expect(mockCellRepository.findAll).toHaveBeenCalled()
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(CellMapper.toResponseDto(cells[0]))
      expect(result[1]).toEqual(CellMapper.toResponseDto(cells[1]))
    })

    it('should return empty array when no cells exist', async () => {
      mockCellRepository.findAll.mockResolvedValue([])

      const result = await useCase.execute()

      expect(mockCellRepository.findAll).toHaveBeenCalled()
      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockCellRepository.findAll.mockRejectedValue(error)

      await expect(useCase.execute()).rejects.toThrow(error)
    })
  })
})
