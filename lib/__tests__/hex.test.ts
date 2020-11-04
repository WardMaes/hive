import {
  HexCoord,
  hasValidCubeCoordinate,
  getNeighbours,
  haveSameCubeCoordinates,
  uniqueCoordinates,
  hexCoordsToLookupTable,
  checkOccupationInLookupTable,
  isHexCoordinateArticulationPoint,
  walkPerimeter,
} from '../hex'

describe('Hex coordinate logic', () => {
  const valid_coordinates: HexCoord[] = [
    { x: 0, y: 0, z: 0 },
    { x: -1, y: 0, z: 1 },
    { x: 1, y: 0, z: -1 },
    { x: 0, y: -1, z: 1 },
    { x: 3, y: -2, z: -1 },
    { x: -2, y: 12, z: -10 },
  ]
  it.each(valid_coordinates)(
    'should return true if coordinates are valid',
    (coord) => {
      expect(hasValidCubeCoordinate(coord)).toBe(true)
    }
  )
  const invalid_coordinates: HexCoord[] = [
    { x: 1, y: 0, z: 0 },
    { x: 1, y: 1, z: -1 },
    { x: 20, y: -19, z: -2 },
    { x: -1, y: -1, z: 3 },
  ]
  it.each(invalid_coordinates)(
    'should return false if coordinates are invalid',
    (coord) => {
      expect(hasValidCubeCoordinate(coord)).toBe(false)
    }
  )

  const hexNeighborsPairs = [
    [
      { x: 0, y: 0, z: 0 },
      [
        { x: 0, y: 1, z: -1 },
        { x: 1, y: 0, z: -1 },
        { x: 1, y: -1, z: 0 },
        { x: 0, y: -1, z: 1 },
        { x: -1, y: 0, z: 1 },
        { x: -1, y: 1, z: 0 },
      ],
    ],
    [
      { x: -2, y: 1, z: 1 },
      [
        { x: -2, y: 2, z: 0 },
        { x: -1, y: 1, z: 0 },
        { x: -1, y: 0, z: 1 },
        { x: -2, y: 0, z: 2 },
        { x: -3, y: 1, z: 2 },
        { x: -3, y: 2, z: 1 },
      ],
    ],
    [
      { x: 1, y: 2, z: -3 },
      [
        { x: 1, y: 3, z: -4 },
        { x: 2, y: 2, z: -4 },
        { x: 2, y: 1, z: -3 },
        { x: 1, y: 1, z: -2 },
        { x: 0, y: 2, z: -2 },
        { x: 0, y: 3, z: -3 },
      ],
    ],
  ]
  it.each(hexNeighborsPairs)(
    'Generates correct neighbors',
    (coord, neighbors) => {
      expect(getNeighbours(coord as HexCoord)).toEqual(neighbors)
    }
  )

  const identical_hex_coords = [
    [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ],
    [
      { y: 5, z: 5, x: -10 },
      { x: -10, y: 5, z: 5 },
    ],
  ]
  it.each(identical_hex_coords)('are same coordinates', (coordA, coordB) => {
    expect(haveSameCubeCoordinates(coordA, coordB)).toEqual(true)
  })
  const unidentical_hex_coords = [
    [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
    ],
    [
      { x: 5, y: 3, z: -8 },
      { z: 5, y: 3, x: -8 },
    ],
  ]
  it.each(unidentical_hex_coords)(
    "aren't same coordinates",
    (coordA, coordB) => {
      expect(haveSameCubeCoordinates(coordA, coordB)).toEqual(false)
    }
  )

  const withDuplicateCoordinates = [
    { x: 0, y: 0, z: 0 },
    { z: 0, y: 0, x: 0 },
    { x: 5, y: -2, z: -3 },
    { x: 5, z: -3, y: -2 },
    { x: 1, y: -1, z: 0 },
  ]
  const theUniqueCoordinates = [
    { x: 0, y: 0, z: 0 },
    { x: 5, y: -2, z: -3 },
    { x: 1, y: -1, z: 0 },
  ]
  it('returns only unique hex coordinates', () => {
    expect(uniqueCoordinates(withDuplicateCoordinates)).toEqual(
      theUniqueCoordinates
    )
  })

  const refInLookUp = { x: -1, y: 1, z: 0 }
  const refNotInLookUp = { x: -5, y: 6, z: -1 }
  const lookUp = hexCoordsToLookupTable([
    { x: -3, y: 1, z: 2 },
    { x: 3, y: -2, z: -1 },
    { x: -3, y: 1, z: 2 },
    refInLookUp,
  ])
  it('finds that hex occupied in lookup table', () => {
    expect(checkOccupationInLookupTable(refInLookUp, lookUp)).toEqual(true)
  })
  it('doesnt find hex in lookup table', () => {
    expect(checkOccupationInLookupTable(refNotInLookUp, lookUp)).toEqual(false)
  })
})

const occupiedCells = [
  { x: -2, y: 3, z: -1 },
  { x: -1, y: 3, z: -2 },
  { x: -1, y: 2, z: -1 },
  { x: -2, y: 2, z: 0 },
  { x: 0, y: 1, z: -1 },
  { x: 0, y: 0, z: 0 },
  { x: 1, y: -1, z: 0 },
  { x: -1, y: 0, z: 1 },
  { x: -2, y: 0, z: 2 },
  { x: 0, y: -1, z: 1 },
]
it('detects as articulation point', () => {
  expect(
    isHexCoordinateArticulationPoint({ x: 0, y: 0, z: 0 }, occupiedCells)
  ).toEqual(true)
  expect(
    isHexCoordinateArticulationPoint({ x: -1, y: 2, z: -1 }, occupiedCells)
  ).toEqual(true)
})

it('detects as non articulation point', () => {
  expect(
    isHexCoordinateArticulationPoint({ x: -1, y: 3, z: -2 }, occupiedCells)
  ).toEqual(false)
  expect(
    isHexCoordinateArticulationPoint({ x: -2, y: 0, z: 2 }, occupiedCells)
  ).toEqual(false)
})

// it('finds the entire perimeter', () => {
//   expect(walkPerimeter({ x: 1, y: -1, z: 0 }, occupiedCells)).toEqual(true)
// })
