import Image from 'next/image'
import { useContext } from 'react'
import classNames from 'classnames'

import { InsectName } from '../lib/insect'
import { gameContext } from '../context/machines'
import { PlayerHand } from '../lib/game'

type InsectSelectorProps = {
  // TODO: rename
  insects: PlayerHand
}

const InsectSelector = ({ insects }: InsectSelectorProps) => {
  const [gameState, sendToGame] = useContext(gameContext)

  console.log(
    gameState.context.unplayedInsectsPlayer1,
    gameState.context.unplayedInsectsPlayer2
  )

  let individualInsects: InsectName[] = []
  insects.forEach((count, insectName) => {
    individualInsects = [...individualInsects, ...Array(count).fill(insectName)]
  })

  return (
    <div className="flex flex-row justify-center content-center h-full flex-wrap">
      {individualInsects.map((insectName, i) => (
        <div
          className={classNames('insect', {
            insect__selected:
              gameState.context.selectedUnplayedInsect! === insectName,
          })}
          key={i + 1}
          onClick={() => {
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
      ))}
    </div>
  )
}

export default InsectSelector
