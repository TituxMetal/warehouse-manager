export class PositionValueObject {
  private readonly _value: number

  constructor(value: number) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error('Position must be a number')
    }

    if (!this.isValidPosition(value)) {
      throw new Error(
        `Invalid position: ${value}. Position must be at least 1 and at most 4 digits`
      )
    }

    this._value = value
  }

  get value(): number {
    return this._value
  }

  equals(other: PositionValueObject): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value.toString().padStart(4, '0')
  }

  private isValidPosition(position: number): boolean {
    const digits = position.toString().length

    if (position < 1 || digits > 4) {
      return false
    }

    return true
  }
}
