import Head from 'next/head'

import { Cell } from "./../lib/hex"
import Board from '../components/Board'



export default function Home() {
  // TODO: I think a fun concept for later
  // const convertKeyStrokesToNeighbor

  const mockCells: Cell[] =[
      { x: 1, y: 1, z: -2 },
      { x: 2, y: -1, z: -1},
      { x: 1, y: 2, z: -3},
      { x: 0, y: 3 , z: -3},

      { x: 0, y: 0, z: 0 }, // center
      { x: -1, y: 1, z: 0 },  // top left
      { x: 0, y: 1, z: -1 },  // top center
      { x: 1, y: 0, z: -1 },  // top right
      { x: -1, y: 0, z: 1 }, // bottom left
      { x: 0, y: -1, z: 1 }, // bottom center
      { x: 1, y: -1, z: 0 }, // bottom right
    ];

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="border">
        <Board cells={mockCells} />
      </main>
    </>
  )
}
