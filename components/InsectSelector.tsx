import Image from 'next/image'
import { useContext } from 'react'
import classNames from 'classnames'

import { gameContext } from '../context/machines'
import { PlayerHand } from '../lib/game'

type InsectSelectorProps = {
  playerHand: PlayerHand
}

const InsectSelector = ({ playerHand: insects }: InsectSelectorProps) => {
  const [gameState, sendToGame] = useContext(gameContext)

  const playerToMove =
    gameState.context.playerId === gameState.context.currentPlayer

  return (
    <div className="flex flex-row gap-2 p-2 justify-center flex-wrap bg-gray-300 border-t border-gray-500">
      {Array.from(insects, ([insectName, amount]) => (
        <div
          className={classNames(
            'border border-gray-500 p-1 relative items-center justify-center',
            gameState.context.selectedUnplayedInsect! === insectName &&
              'bg-blue-300',
            playerToMove || 'select-none cursor-not-allowed'
          )}
          key={insectName}
          onClick={() => {
            playerToMove && sendToGame('UNPLAYEDPIECE.SELECT', { insectName })
          }}
        >
          <span
            style={{ fontSize: '0.6rem' }}
            className={classNames(
              'bg-gray-500 w-3 h-3 -ml-1 -mb-1',
              'flex items-center justify-center',
              'border border-black absolute left-0 bottom-0'
            )}
          >
            {amount}
          </span>
          <Image
            src={`/icons/${insectName.toLowerCase()}.svg`}
            width="50"
            height="50"
            alt={`${insectName}`}
            priority
          />
        </div>
      ))}
    </div>
  )
}

export default InsectSelector
