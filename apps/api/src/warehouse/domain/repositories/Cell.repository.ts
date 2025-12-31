import type { AisleEntity } from '../entities/Aisle.entity'
import type { CellEntity } from '../entities/Cell.entity'
import type { CellValueObject } from '../value-objects/Cell.vo'

export interface CellWithAisles extends CellEntity {
  aisles: AisleEntity[]
}

export interface ICellRepository {
  findById(id: number): Promise<CellEntity | null>
  findByNumber(number: CellValueObject): Promise<CellEntity | null>
  findAll(): Promise<CellEntity[]>
  findWithAisles(id: number): Promise<CellWithAisles | null>
  create(cell: CellEntity): Promise<CellEntity>
  update(cell: CellEntity): Promise<CellEntity>
  delete(id: number): Promise<void>
  exists(id: number): Promise<boolean>
}
