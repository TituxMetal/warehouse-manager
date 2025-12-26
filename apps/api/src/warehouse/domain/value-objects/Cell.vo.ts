export class CellValueObject {
  private readonly _value: number

  constructor(value: number) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error('Cell must be a number')
    }

    if (!this.isValidCell(value)) {
      throw new Error(`Invalid cell: ${value}. Cell must be 1 positive digit`)
    }

    this._value = value
  }

  get value(): number {
    return this._value
  }

  equals(other: CellValueObject): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value.toString()
  }

  private isValidCell(cell: number): boolean {
    // A valid cell must be a single positive digit: an integer from 1 to 9.
    if (!Number.isInteger(cell)) {
      return false
    }

    if (cell < 1 || cell > 9) {
      return false
    }

    return true
  }
}
