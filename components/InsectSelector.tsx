import { useContext } from 'react'

import { Insect, InsectName } from '../lib/insect'
import { gameContext } from '../context/machines'
import { PlayerHand } from '../lib/game'

type InsectSelectorProps = {
  // TODO needs a rename
  insects: PlayerHand
}

const InsectSelector = ({ insects }: InsectSelectorProps) => {
  const [test, sendToGame] = useContext(gameContext)

  let individualInsects: InsectName[] = []
  insects.forEach((count, insectName) => {
    individualInsects = [...individualInsects, ...Array(count).fill(insectName)]
  })

  return (
    <div className="flex flex-row justify-center content-center h-full flex-wrap">
      {individualInsects.map((insectName, i) => (
        <div
          className="insect"
          key={i + 1}
          onClick={() => {
            sendToGame('UNPLAYEDPIECE.SELECT', { insectName })
          }}
        >
          {JSON.stringify(insectName, null, 2)}
        </div>
      ))}
    </div>
  )
}

export default InsectSelector
