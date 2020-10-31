import { useContext } from 'react'

import { Insect } from '../machines/game'
import { gameContext } from '../context/machines'

type InsectSelectorProps = {
  insects: Insect[]
}

const InsectSelector = ({ insects }: InsectSelectorProps) => {
  const [_, sendToGame] = useContext(gameContext)

  return (
    <div className="flex flex-row justify-center content-center h-full flex-wrap">
      {insects.map((insect) => (
        <div className="insect" onClick={() => sendToGame('PLACE', { insect })}>
          {JSON.stringify(insect, null, 2)}
        </div>
      ))}
    </div>
  )
}

export default InsectSelector
