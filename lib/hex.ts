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

const uniqueCells = (cells: HexCoord[]): HexCoord[] => {
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

const hexCoordsToLookupTable = <T>(
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
    } else if (!corresponding) {
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
  // Checks whether, if the given coordinate would be removed, the graph of hexes would be split in more, no longer connected graphs
  // Super simple but quite inefficient: remove tested hex coordinate from all hexes, take random starting point, explore graph and check whether each other hex can be reached

  // Remove duplicates
  // TODO probably delete later, higher level should only give hexes on the same level => no duplicate coords
  const uniqueOtherHexs = new Set(otherHexs)
  // Remove tested hex if it is present
  uniqueOtherHexs.delete(coord)
  // Select random starting point
  const start = Array.from(uniqueOtherHexs.values())[0]
  // Remove random starting point indicating it as discoverd
  uniqueOtherHexs.delete(start)
  const lookUp = hexCoordsToLookupTable(otherHexs)
  // const discovered: Set<HexCoord> = new Set([ start ])
  const queue = [start]

  while (queue.length > 0) {
    const current = queue.shift()
    const currentNeighbors = getNeighbours(current!).filter((el) =>
      checkOccupationInLookupTable(el, lookUp)
    )
    const undiscoverdNeighbors = currentNeighbors.filter((el) =>
      uniqueOtherHexs.has(el)
    )
    undiscoverdNeighbors.forEach((el) => {
      uniqueOtherHexs.delete(el)
      queue.push(el)
    })
  }

  return uniqueOtherHexs.size > 0
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
  // Create lookup table
  const lookUp = hexCoordsToLookupTable<null>(otherHexs)
  const discovered: Set<HexCoord> = new Set([startCoord])
  // Path keeps record of traveled path
  // All neighbors discovered to be new destinations have previous coordinate in common so push it on the path
  const path = [startCoord]

  return recursiveFindPerimeterNeighbors(
    startCoord,
    lookUp,
    max_distance,
    path,
    discovered
  )
}

const recursiveFindPerimeterNeighbors = (
  currentCoord: HexCoord,
  lookUp: HexLookupTable<null>,
  // otherHexs: HexCoord[],
  max_distance = Infinity,
  path: HexCoord[] = [],
  discovered: Set<HexCoord>
): Move[] => {
  // Base case where maximum distance has been explored
  if (max_distance <= 0) {
    return []
  }

  const isOccupied = ({ x, y, z }: HexCoord) => {
    return x in lookUp && y in lookUp[x] && z in lookUp[x][y]
  }

  const neighbors = getNeighbours(currentCoord)
  // Check which neighbors were already discovered by a shorter path (since breadth first is used)
  let notYetDiscovered = neighbors.filter((value) => !discovered.has(value))
  // Check which aren't occupied
  let unoccupied = notYetDiscovered.filter((value) => {
    return !isOccupied(value)
  })
  // Pieces cant move through "holes" in the hive where, assuming the neighbor you're trying to move to is direction X,
  // the neighbors at X - 60° and X + 60° are occupied
  // But if neither is occupied, that means that the destination move no longer touches the hive, which is also illegal
  let notTooNarrowAndTouchesHive = unoccupied.filter((value) => {
    // Find direction of the move
    const neighborIndex = neighbors.findIndex((value) =>
      haveSameCubeCoordinates(value, currentCoord)
    )
    const leftNeighborOccupied = isOccupied(neighbors[neighborIndex - (1 % 6)])
    const rightNeighborOccupied = isOccupied(neighbors[neighborIndex + (1 % 6)])
    return (
      (leftNeighborOccupied && !rightNeighborOccupied) ||
      (!leftNeighborOccupied && rightNeighborOccupied)
    )
  })

  const discoveredMoves: Move[] = []
  notTooNarrowAndTouchesHive.forEach((coord) => {
    discovered.add(coord)
    discoveredMoves.push({
      length: path.length + 1,
      destination: coord,
      path: [...path, coord],
    })
    discoveredMoves.push(
      ...recursiveFindPerimeterNeighbors(
        coord,
        lookUp,
        max_distance - 1,
        [...path, coord],
        discovered
      )
    )
  })
  return discoveredMoves
}

export {
  uniqueCells,
  hasValidCubeCoordinate,
  getNeighbours,
  haveSameCubeCoordinates,
  filterOverlap,
}
