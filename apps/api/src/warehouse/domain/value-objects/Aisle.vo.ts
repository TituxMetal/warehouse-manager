export class AisleValueObject {
  private readonly _value: number

  constructor(value: number) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error('Aisle must be a number')
    }

    if (!this.isValidAisle(value)) {
      throw new Error(`Invalid aisle: ${value}. Aisle must be at least 1 and at most 3 digits`)
    }

    this._value = value
  }

  get value(): number {
    return this._value
  }

  equals(other: AisleValueObject): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value.toString().padStart(3, '0')
  }

  private isValidAisle(aisle: number): boolean {
    // Aisle must be a positive integer between 1 and 999 (1 to 3 digits).
    return Number.isInteger(aisle) && aisle >= 1 && aisle <= 999
  }
}
