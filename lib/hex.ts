export type HexCoord = {
  x: number
  y: number
  z: number
}

export type Move = {
  length: number
  destination: HexCoord
  path: HexCoord[]
}

const hasValidCubeCoordinate = (hexCoord: HexCoord): Boolean => {
  return hexCoord.x + hexCoord.y + hexCoord.z == 0
}

// Returns the neighbors in clockwise order
const getNeighbours = (hexCoord: HexCoord): HexCoord[] => {
  return [
    // Note that these directions only apply in flat configuration
    { x: hexCoord.x, y: hexCoord.y + 1, z: hexCoord.z - 1 }, // Top
    { x: hexCoord.x + 1, y: hexCoord.y, z: hexCoord.z - 1 }, // Right-top
    { x: hexCoord.x + 1, y: hexCoord.y - 1, z: hexCoord.z }, // Right-bottom
    { x: hexCoord.x, y: hexCoord.y - 1, z: hexCoord.z + 1 }, // Bottom
    { x: hexCoord.x - 1, y: hexCoord.y, z: hexCoord.z + 1 }, // Left-bottom
    { x: hexCoord.x - 1, y: hexCoord.y + 1, z: hexCoord.z }, // Left-top
  ]
}

const haveSameCubeCoordinates = (
  coordA: HexCoord,
  coordB: HexCoord
): Boolean => {
  return coordA.x == coordB.x && coordA.y == coordB.y && coordA.z == coordB.z
}

const uniqueCoordinates = (cells: HexCoord[]): HexCoord[] => {
  return cells.filter(
    (cell, i, array) =>
      array.findIndex((a) => haveSameCubeCoordinates(a, cell)) === i
  )
}

const filterOverlap = (
  coordsA: HexCoord[],
  coordsB: HexCoord[]
): HexCoord[] => {
  return coordsA.filter((coordA) =>
    coordsB.find((coordB) => !haveSameCubeCoordinates(coordA, coordB))
  )
}

/* 
  Lookup table
*/

type HexLookupTable<T> = {
  [x: number]: { [y: number]: { [z: number]: T[] | null } }
}

export const hexCoordsToLookupTable = <T>(
  hexCoords: HexCoord[],
  corresponding?: T[]
): HexLookupTable<T> => {
  const table: {
    [x: number]: { [y: number]: { [z: number]: T[] | null } }
  } = {}
  for (const [idx, coord] of hexCoords.entries()) {
    const { x, y, z } = coord
    if (!(x in table)) {
      table[x] = {}
    }
    if (!(y in table[x])) {
      table[x][y] = {}
    }
    if (!(z in table[x][y])) {
      table[x][y][z] = !corresponding ? null : [corresponding[idx]]
    } else if (corresponding) {
      table[x][y][z]!.push(corresponding![idx])
    }
  }
  return table
}

export const checkOccupationInLookupTable = <T>(
  { x, y, z }: HexCoord,
  lookUp: HexLookupTable<T>
): Boolean => {
  return x in lookUp && y in lookUp[x] && z in lookUp[x][y]
}

/* 
  Articulation
*/

export const isHexCoordinateArticulationPoint = (
  coord: HexCoord,
  otherHexs: HexCoord[]
): Boolean => {
  let uniqueCoords = uniqueCoordinates(otherHexs)
  // Remove coordinate being tested as articulation point
  uniqueCoords = uniqueCoords.filter(
    (uniqueCoor) => !haveSameCubeCoordinates(uniqueCoor, coord)
  )
  // Select random staring point from remaining coords and remove it to mark it as discovered
  // Just discovered coordinates are put a queue as starting of points for further exploration
  let queue = uniqueCoords.length ? [uniqueCoords.shift()!] : []
  // While there are still unexplored coordinates
  while (queue.length > 0) {
    const current = queue.shift()!
    const neighbors = getNeighbours(current)
    const unDiscoveredNeighbors = neighbors.filter(
      (coord) =>
        uniqueCoords.findIndex((otherCoord) =>
          haveSameCubeCoordinates(coord, otherCoord)
        ) != -1
    )
    // Add the undiscovered neighbors to the queue
    queue = [...queue, ...unDiscoveredNeighbors]
    // Remove now discovered neighbors from list to mark as discovered*
    uniqueCoords = uniqueCoords.filter(
      (coord) =>
        unDiscoveredNeighbors.findIndex((otherCoord) =>
          haveSameCubeCoordinates(coord, otherCoord)
        ) == -1
    )
  }
  return uniqueCoords.length > 0
}

// type HexCoordGraphNode = {
//   value: HexCoord,
//   neighbors: HexCoord[]
// }

// TODO implement more efficient connected modules in graph algorithm to find all articulation points
const getArticulationPointsHexCoordinates = (hexCoords: HexCoord[]) => {
  // Remove duplicates
  // TODO probably delete later, higher level should only give hexes on the same level => no duplicate coords
  const uniqueOtherHexs = new Set(hexCoords)
  // Is graph algorithm so convert graph (easier to work with and avoids converting all the time)

  const startHexCoord = hexCoords[0]

  const discovered: Set<HexCoord> = new Set()
  const preOrderFoundCounterLookup = new Map<HexCoord, number>()
  const lowestDiscIndexReachableMap = new Map<HexCoord, number>()

  getArticulationPointsHexCoordinatesRecHelper(
    startHexCoord,
    null,
    discovered,
    preOrderFoundCounterLookup,
    lowestDiscIndexReachableMap
  )
}

const getArticulationPointsHexCoordinatesRecHelper = (
  coord: HexCoord,
  parent: HexCoord | null,
  discovered: Set<HexCoord>,
  preOrderFoundCounterLookup: Map<HexCoord, number>,
  lowestDiscIndexReachableMap: Map<HexCoord, number>
) => {
  discovered.add(coord)
  // Will save number which indicates when iteration it was discovered
  const preOrderIndex = preOrderFoundCounterLookup.size
  preOrderFoundCounterLookup.set(coord, preOrderIndex)
  // Initially, the furthest reachable node is set as itself
  lowestDiscIndexReachableMap.set(coord, preOrderIndex)

  getNeighbours(coord).filter((el) => checkOccupationInLookupTable(el, lo))
}

/* 
  Perimeter walking
*/

export const walkPerimeter = (
  startCoord: HexCoord,
  otherHexs: HexCoord[],
  max_distance = Infinity
): Move[] => {
  // FFS WTF JAVASCRIPT
  const actualModulo = (a: number, b: number): number =>
    a >= 0 ? a % b : b + (a % b)
  // Create lookup table
  const lookUp = hexCoordsToLookupTable<null>(otherHexs)
  const discovered: HexCoord[] = [startCoord]
  let idx = 0
  const foundMoves: Move[] = [
    {
      length: 0,
      destination: startCoord,
      path: [startCoord],
    },
  ]

  // Iterate over previously found paths and look if they can be expanded
  while (idx < foundMoves.length) {
    // Get preceding move
    const {
      length: prevLength,
      destination: lastCoord,
      path: prevPath,
    } = foundMoves[idx]
    // Dont look for larger paths if the maximum distance has been reached
    if (!(prevLength + 1 >= max_distance)) {
      const neighbors = getNeighbours(lastCoord)
      // A neighbor is a valid position if
      const validNeighbors = neighbors
        // A shorter or equal length path to there hasn't already been found
        .filter(
          (coord) =>
            discovered.filter((discoveredCoord) =>
              haveSameCubeCoordinates(coord, discoveredCoord)
            ).length == 0
        )
        // Isn't occupied by another cell
        .filter((coord) => !checkOccupationInLookupTable(coord, lookUp))
        // Two part:
        // If there are 2 neigbors at, with direction of move X, X - 60° and X + 60°; then it cant move naturally between these 2
        // But if neither is present, then you no longer touch the orignal side and thus are no longer connected to the same perimeter
        .filter((coord) => {
          const neighborIndex = neighbors.findIndex((neighborCoord) =>
            haveSameCubeCoordinates(neighborCoord, coord)
          )
          console.log(actualModulo(neighborIndex - 1, 6))
          const leftNeighborOccupied = checkOccupationInLookupTable(
            neighbors[actualModulo(neighborIndex - 1, 6)],
            lookUp
          )
          const rightNeighborOccupied = checkOccupationInLookupTable(
            neighbors[actualModulo(neighborIndex + 1, 6)],
            lookUp
          )
          return (
            (leftNeighborOccupied && !rightNeighborOccupied) ||
            (!leftNeighborOccupied && rightNeighborOccupied)
          )
        })
      validNeighbors.forEach((valid) => {
        discovered.push(valid)
        foundMoves.push({
          length: prevLength + 1,
          destination: valid,
          path: [...prevPath, valid],
        })
      })
    }
    idx++
  }
  // Skip the first where the piece isn't moved since it isn't a valid move
  return foundMoves.slice(1)
}

/* 
  Axis
*/

// Return arrays for each direction, on each axis, with other coordinates on that axis, ordered by distance
export enum Axis {
  X,
  Y,
  Z,
}

export enum AxisDirection {
  PLUS,
  MINUS,
}

export const shiftAlongAxis = (
  coord: HexCoord,
  axis: Axis,
  direction: AxisDirection,
  distance: number = 1
): HexCoord => {
  const coordCopy = { ...coord }

  const modifier: number = direction === AxisDirection.PLUS ? 1 : -1

  if (axis === Axis.X) {
    coordCopy.y = coordCopy.y + modifier * distance
    coordCopy.z = coordCopy.z - modifier * distance
  } else if (axis === Axis.Y) {
    coordCopy.x = coordCopy.x + modifier * distance
    coordCopy.z = coordCopy.z - modifier * distance
  } else {
    coordCopy.x = coordCopy.x + modifier * distance
    coordCopy.y = coordCopy.y - modifier * distance
  }

  return coordCopy
}

export {
  uniqueCoordinates,
  hasValidCubeCoordinate,
  getNeighbours,
  haveSameCubeCoordinates,
  filterOverlap,
}
