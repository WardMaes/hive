import Head from 'next/head'

import Board, { BoardType } from '../components/Board'



export default function Home() {

  const mockBoard: BoardType = {
    cells: [
      { x: 0, y: 0, z: 0 }, // center
      { x: -1, y: 1, z: 0 },  // top left
      { x: -1, y: 1, z: 0 },  // top center
      { x: 1, y: 0, z: -1 },  // top right
      { x: -1, y: 0, z: 1 }, // bottom left
      { x: 0, y: -1, z: 1 }, // bottom center
      { x: 1, y: -1, z: 0 }, // bottom right
    ],
  }

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="border">
        <Board board={mockBoard} />
      </main>
    </>
  )
}
