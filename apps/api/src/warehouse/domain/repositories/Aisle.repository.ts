import type { AisleEntity } from '../entities/Aisle.entity'
import type { BayEntity } from '../entities/Bay.entity'
import type { LocationEntity } from '../entities/Location.entity'

export interface AisleWithBays extends AisleEntity {
  bays: BayEntity[]
}

export interface AisleWithLocations extends AisleEntity {
  locations: LocationEntity[]
}

export interface IAisleRepository {
  findById(id: number): Promise<AisleEntity | null>
  findByCellId(cellId: number): Promise<AisleEntity[]>
  findWithBays(id: number): Promise<AisleWithBays | null>
  findWithLocations(id: number): Promise<AisleWithLocations | null>
  create(aisle: AisleEntity): Promise<AisleEntity>
  createMany(aisles: AisleEntity[]): Promise<AisleEntity[]>
  update(aisle: AisleEntity): Promise<AisleEntity>
  delete(id: number): Promise<void>
}
