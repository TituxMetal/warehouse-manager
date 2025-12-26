import type { CellEntity } from '../entities/Cell.entity'
import type { CellValueObject } from '../value-objects/Cell.vo'

export interface ICellRepository {
  findById(id: number): Promise<CellEntity | null>
  findByNumber(number: CellValueObject): Promise<CellEntity | null>
  findAll(): Promise<CellEntity[]>
  create(cell: CellEntity): Promise<CellEntity>
  update(cell: CellEntity): Promise<CellEntity>
  delete(id: number): Promise<void>
  exists(id: number): Promise<boolean>
}
