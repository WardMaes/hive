import { GetServerSideProps } from 'next'
import React, { useContext, useEffect } from 'react'

import { gameContext } from '../../context/machines'

import { InsectSelector, Board, Loader } from '../../components'

type RoomProps = {
  id: string
  roomId: string
  initiator: boolean
}

const Room = ({ roomId, initiator }: RoomProps) => {
  const [gameState, sendToGame] = useContext(gameContext)

  const playerToMove =
    gameState.context.playerId === gameState.context.currentPlayer

  useEffect(() => {
    sendToGame(initiator ? 'GAME.CREATE' : 'GAME.JOIN', { roomId })
  }, [])

  useEffect(() => {
    if (gameState.matches('playing')) {
      // Cleanup url so it's easier to send to player 2
      var queryParams = new URLSearchParams(window.location.search)
      queryParams.delete('create')
      history.replaceState(null, '', '?' + queryParams.toString())
    }
  }, [gameState.value])

  return (
    <div className="w-full">
      <div className="w-full">
        {gameState.matches('creating') && (
          <div className="my-32">
            <Loader text="Creating game..." />
          </div>
        )}

        {gameState.matches('joining') && (
          <div className="my-32">
            <Loader text="Joining game..." />
          </div>
        )}

        {gameState.matches('searching') && (
          <div className="my-32">
            <Loader text="Searching game..." />
          </div>
        )}

        {gameState.matches('error') && (
          <div className="my-32 flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl">An error occured </h2>
            <span className="text-red-600 my-4">
              {JSON.stringify(gameState.context.error, null, 2)}
            </span>
            <button
              className="btn hover:bg-gray-400"
              onClick={() => sendToGame('RESET')}
            >
              Back to menu
            </button>
          </div>
        )}

        {(gameState.matches('playing') ||
          gameState.matches('opponentTurn')) && (
          <div className="game w-full">
            <div className="fixed top-0 right-0 p-4">
              {playerToMove ? 'Your turn' : "Opponent's turn"}
            </div>
            <div className="board-wrapper">
              <Board
                cells={gameState.context.cells}
                // selectableCells={gameState.context.selectableCells}
              />
            </div>
            <div className="insect-selector">
              <InsectSelector
                playerHand={
                  gameState.context.currentPlayer === 1
                    ? gameState.context.unplayedInsectsPlayer1
                    : gameState.context.unplayedInsectsPlayer2
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Room

export const getServerSideProps: GetServerSideProps = async (context) => {
  const roomId = context.params?.roomId
  let initiator = !!context.query?.create

  return { props: { roomId, initiator } }
}
