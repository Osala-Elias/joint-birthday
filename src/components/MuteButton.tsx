import { useState } from 'react'
import { isMuted, setMuted } from '../engine/audio'

export default function MuteButton() {
  const [m, setM] = useState(isMuted())
  return (
    <button
      onClick={() => {
        setMuted(!m)
        setM(!m)
      }}
      aria-label={m ? 'Unmute' : 'Mute'}
      className="fixed right-4 top-4 z-50 rounded-full border border-white/20 bg-black/30 px-3 py-2 text-sm text-white/80 backdrop-blur"
    >
      {m ? '🔇' : '🔈'}
    </button>
  )
}
