import {
  AisleValueObject,
  CellValueObject,
  LevelValueObject,
  PositionValueObject
} from '../value-objects'

export interface ParsedAddress {
  cell: CellValueObject
  aisle: AisleValueObject
  position: PositionValueObject
  level: LevelValueObject
}

export class LocationAddressParser {
  private static readonly ADDRESS_PATTERN = /^(\d)-(\d{3})-(\d{4})-(\d{2})$/

  parse(address: string): ParsedAddress {
    const match = LocationAddressParser.ADDRESS_PATTERN.exec(address)

    if (!match) {
      throw new Error(`Invalid location address format: ${address}`)
    }

    const [, cellStr, aisleStr, positionStr, levelStr] = match

    const cell = new CellValueObject(parseInt(cellStr, 10))
    const aisle = new AisleValueObject(parseInt(aisleStr, 10))
    const position = new PositionValueObject(parseInt(positionStr, 10))
    const level = new LevelValueObject(parseInt(levelStr, 10))

    return { cell, aisle, position, level }
  }

  format(
    cell: CellValueObject,
    aisle: AisleValueObject,
    position: PositionValueObject,
    level: LevelValueObject
  ): string {
    const cellStr = cell.toString()
    const aisleStr = aisle.toString()
    const positionStr = position.toString()
    const levelStr = level.toString()

    return `${cellStr}-${aisleStr}-${positionStr}-${levelStr}`
  }

  isValid(address: string): boolean {
    try {
      const parsedAddress = this.parse(address)

      const formattedAddress = this.format(
        parsedAddress.cell,
        parsedAddress.aisle,
        parsedAddress.position,
        parsedAddress.level
      )

      return address === formattedAddress
    } catch {
      return false
    }
  }
}
