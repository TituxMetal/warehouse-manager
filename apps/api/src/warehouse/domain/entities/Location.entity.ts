import type { AisleValueObject } from '../value-objects/Aisle.vo'
import type { CellValueObject } from '../value-objects/Cell.vo'
import type { LevelValueObject } from '../value-objects/Level.vo'
import type { PositionValueObject } from '../value-objects/Position.vo'

export type LocationStatus = 'available' | 'occupied' | 'blocked'

export class LocationEntity {
  constructor(
    public readonly id: number,
    public readonly position: PositionValueObject,
    public readonly level: LevelValueObject,
    private _status: LocationStatus,
    public readonly aisleId: number,
    public readonly bayId: number,
    private _blockReasonId: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get status(): LocationStatus {
    return this._status
  }

  get blockReasonId(): number | null {
    return this._blockReasonId
  }

  /**
   * Check if this is a picking location (ground level)
   */
  isPicking(): boolean {
    return this.level.isPicking()
  }

  /**
   * Check if this location is blocked by an obstacle
   */
  isBlocked(): boolean {
    return this._blockReasonId !== null
  }

  /**
   * Check if this location can receive products
   * Must be available status AND not blocked
   */
  isAvailable(): boolean {
    return this._status === 'available' && !this.isBlocked()
  }

  /**
   * Block this location with a reason
   */
  block(reasonId: number): void {
    if (this._blockReasonId !== null) {
      throw new Error('Location is already blocked')
    }

    this._blockReasonId = reasonId
    this._status = 'blocked'
  }

  /**
   * Unblock this location
   */
  unblock(): void {
    if (this._blockReasonId === null) {
      throw new Error('Location is not blocked')
    }

    this._blockReasonId = null
    this._status = 'available'
  }

  /**
   * Formats the full warehouse address: "cell-aisle-position-level"
   * Example: "4-016-0026-30"
   *
   * @param cellNumber - Cell value object from parent context
   * @param aisleNumber - Aisle value object from parent context
   */
  formatFullAddress(cellNumber: CellValueObject, aisleNumber: AisleValueObject): string {
    return `${cellNumber}-${aisleNumber}-${this.position}-${this.level}`
  }
}
