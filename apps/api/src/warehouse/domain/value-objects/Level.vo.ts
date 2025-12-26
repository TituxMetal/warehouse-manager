export class LevelValueObject {
  private readonly _value: number

  constructor(value: number) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error('Level must be a number')
    }

    if (!this.isValidLevel(value)) {
      throw new Error(`Invalid level: ${value}. Valid levels are: 2 digits and divisible by 10`)
    }

    this._value = value
  }

  get value(): number {
    return this._value
  }

  equals(other: LevelValueObject): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value.toString().padStart(2, '0')
  }

  isPicking(): boolean {
    return this._value === 0
  }

  isReserve(): boolean {
    return this._value > 0
  }

  private isValidLevel(level: number): boolean {
    if (level < 0) {
      return false
    }

    if (level % 10 !== 0 || level > 90) {
      return false
    }

    return true
  }
}
