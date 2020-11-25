import Image from 'next/image'
import { useContext } from 'react'
import classNames from 'classnames'

import { InsectName } from '../lib/insect'
import { gameContext } from '../context/machines'
import { PlayerHand } from '../lib/game'

type InsectSelectorProps = {
  playerHand: PlayerHand
}

const InsectSelector = ({ playerHand: insects }: InsectSelectorProps) => {
  const [gameState, sendToGame] = useContext(gameContext)

  let individualInsects: InsectName[] = []
  insects.forEach((count, insectName) => {
    individualInsects = [...individualInsects, ...Array(count).fill(insectName)]
  })

  const playerToMove =
    gameState.context.playerId === gameState.context.currentPlayer

  return (
    <div
      className={'flex flex-row justify-center content-center h-full flex-wrap'}
    >
      {individualInsects.map((insectName, i) => {
        const insectCanBePlayed = gameState.context.insectsAllowedToPlace?.includes(
          insectName
        )
        const isSelectedInsect =
          gameState.context.selectedUnplayedInsect! === insectName
        return (
          <div
            className={classNames('insect', {
              insect__selected: isSelectedInsect,
              insect__disabled: !playerToMove || !insectCanBePlayed,
            })}
            key={i + 1}
            onClick={() => {
              if (playerToMove || !insectCanBePlayed)
                sendToGame('UNPLAYEDPIECE.SELECT', { insectName })
            }}
          >
            <Image
              src={`/icons/${insectName.toLowerCase()}.svg`}
              width="50"
              height="50"
              alt={`${insectName}`}
              priority
            />
          </div>
        )
      })}
    </div>
  )
}

export default InsectSelector
