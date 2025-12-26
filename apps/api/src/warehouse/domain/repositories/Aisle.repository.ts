import type { AisleEntity } from '../entities/Aisle.entity'

export interface IAisleRepository {
  findById(id: number): Promise<AisleEntity | null>
  findByCellId(cellId: number): Promise<AisleEntity[]>
  create(aisle: AisleEntity): Promise<AisleEntity>
  update(aisle: AisleEntity): Promise<AisleEntity>
  delete(id: number): Promise<void>
}
