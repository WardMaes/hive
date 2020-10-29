import Head from 'next/head'
import { useState } from 'react'

import {
  Cell,
  uniqueCells,
  getNeighbours,
  haveSameCubeCoordinates,
} from './../lib/hex'
import Board from '../components/Board'

// TODO: refactor this in 1 function 'addNeighbours'
let mockCells: Cell[] = [
  // { x: 1, y: 1, z: -2, occupied: true },
  // { x: 2, y: -1, z: -1, occupied: true },
  // { x: 1, y: 2, z: -3, occupied: true },
  // { x: 0, y: 3, z: -3, occupied: true },
  { x: 0, y: 0, z: 0, occupied: true }, // center
  // { x: -1, y: 1, z: 0, occupied: true }, // top left
  // { x: 0, y: 1, z: -1, occupied: true }, // top center
  // { x: 1, y: 0, z: -1, occupied: true }, // top right
  // { x: -1, y: 0, z: 1, occupied: true }, // bottom left
  // { x: 0, y: -1, z: 1, occupied: true }, // bottom center
  // { x: 1, y: -1, z: 0, occupied: true }, // bottom right
]
const neighbours = uniqueCells(
  mockCells.concat.apply([], mockCells.map(getNeighbours))
)
neighbours.forEach((n) => mockCells.push({ ...n, occupied: false }))
mockCells = uniqueCells(mockCells)

export default function Home() {
  // TODO: I think a fun concept for later
  // const convertKeyStrokesToNeighbor
  const [cells, setCells] = useState(mockCells)

  // TODO: refactor occupied-boolean to piece
  // TODO: fix bug: every click on a cell adds new cells
  // TODO: cleanup this shit dirty code :))))
  const handlePlace = (cell: Cell) => {
    let copy = cells
    const idx = copy.findIndex((c) => haveSameCubeCoordinates(c, cell))
    copy[idx].occupied = !copy[idx].occupied

    // TODO: only add neighbours when needed
    const neighbours2 = uniqueCells(
      copy.concat.apply([], copy.map(getNeighbours))
    )
    neighbours2.forEach((n) => copy.push({ ...n, occupied: false }))
    copy = uniqueCells(copy)

    setCells([...copy])
  }

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="border">
        <Board cells={cells} onPlace={handlePlace} />
      </main>
    </>
  )
}
