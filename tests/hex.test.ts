import { hasValidCubeCoordinate, HexCoord } from '../lib/hex'

describe('Hex library', () => {
  it('should return true if coordinates are valid', () => {
    const validCoord1 = { x: 0, y: 0, z: 0 }
    expect(hasValidCubeCoordinate(validCoord1)).toBe(true)
    const validCoord2 = { x: -1, y: 0, z: 1 }
    expect(hasValidCubeCoordinate(validCoord2)).toBe(true)
  })
  it('should return false if coordinates are invalid', () => {
    const invalidCoord1 = { x: 0, y: -1, z: 0 }
    expect(hasValidCubeCoordinate(invalidCoord1)).toBe(false)
    const invalidCoord2 = { x: 8, y: 0, z: 1 }
    expect(hasValidCubeCoordinate(invalidCoord2)).toBe(false)
  })
})
