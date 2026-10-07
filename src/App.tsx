import { useEffect, useState } from 'react'
import BackgroundCanvas from './components/BackgroundCanvas'
import MuteButton from './components/MuteButton'
import Arrival from './chapters/Arrival'
import Story from './chapters/Story'
import Memories from './chapters/Memories'
import Letters from './chapters/Letters'
import Cake from './chapters/Cake'
import Finale from './chapters/Finale'
import { experience } from './config/experience'
import { playTrack } from './engine/audio'
import type { Mood } from './engine/background'

// Background mood for each chapter (index = chapter number)
const moods: Mood[] = ['stars', 'lights', 'stars', 'lights', 'stars', 'stars']

const CALM = 0.5 // volume of the quiet part of the song
const PARTY = 0.85 // volume of the celebration part

// Dev shortcut: ?preview&chapter=5 jumps straight to a chapter
const params = new URLSearchParams(window.location.search)
const startChapter = params.has('preview') ? Number(params.get('chapter')) || 0 : 0

export default function App() {
  const [chapter, setChapter] = useState(startChapter)
  const [party, setParty] = useState(false)

  // Music starts as soon as the site opens (or at the first tap if the browser blocks it)
  useEffect(() => {
    playTrack(experience.audio.ambient, CALM)
  }, [])

  const next = () => {
    setParty(false)
    if (chapter + 1 === 5) playTrack(experience.audio.finale, PARTY, 700)
    setChapter((c) => c + 1)
  }
  const back = () => {
    setParty(false)
    playTrack(experience.audio.ambient, CALM, 1200) // return to the calm part
    setChapter((c) => Math.max(0, c - 1))
  }
  const restart = () => {
    setParty(false)
    playTrack(experience.audio.ambient, CALM, 1200)
    setChapter(0)
  }
  const celebrate = () => {
    setParty(true)
    playTrack(experience.audio.cake, PARTY, 700) // chorus hits with the confetti
  }
  const mood: Mood = party ? 'celebration' : (moods[chapter] ?? 'lights')

  return (
    <>
      <BackgroundCanvas mood={mood} />
      <MuteButton />

      {chapter > 0 && (
        <button
          onClick={back}
          aria-label="Previous chapter"
          className="fixed left-4 top-4 z-50 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs tracking-[0.25em] text-white/80 backdrop-blur transition hover:bg-white/10"
        >
          ← BACK
        </button>
      )}

      <div key={chapter} className="chapter-in">
        {chapter === 0 && (
          <Arrival onStart={() => playTrack(experience.audio.ambient, CALM)} onEnter={next} />
        )}

        {chapter === 1 && <Story onNext={next} />}

        {chapter === 2 && <Memories onNext={next} />}

        {chapter === 3 && <Letters onNext={next} />}

        {chapter === 4 && <Cake onNext={next} onCelebrate={celebrate} />}

        {chapter === 5 && <Finale onRestart={restart} />}
      </div>
    </>
  )
}
