import { Howl, Howler } from 'howler'

let current: Howl | null = null
let currentSrc = ''
let muted = false

// If the browser blocks sound, remember what we wanted to play and retry on the first tap/click/key
let pending: { src: string; volume: number; fadeMs: number } | null = null
const GESTURES = ['pointerup', 'touchend', 'keydown', 'click'] as const

function arm() {
  GESTURES.forEach((g) => window.addEventListener(g, onGesture, { passive: true }))
}
function disarm() {
  GESTURES.forEach((g) => window.removeEventListener(g, onGesture))
}
function onGesture() {
  if (!pending) return
  const p = pending
  pending = null
  disarm()
  if (current) {
    current.unload() // drop the blocked copy, then start fresh inside the tap
    current = null
    currentSrc = ''
  }
  playTrack(p.src, p.volume, p.fadeMs)
}

export function playTrack(src: string, volume = 0.6, fadeMs = 1500) {
  if (current && currentSrc === src) return // already playing (or waiting to play) this track

  const old = current
  const oldSrc = currentSrc
  let unloadTimer: number | undefined

  const next: Howl = new Howl({
    src: [src],
    loop: true,
    volume: 0,
    html5: true,
    onplayerror: () => {
      pending = { src, volume, fadeMs }
      arm()
    },
    onloaderror: () => {
      console.warn('Could not load audio:', src)
      // keep the previous music going if the new file is missing
      if (old) {
        window.clearTimeout(unloadTimer)
        old.fade(old.volume(), volume, 500)
        current = old
        currentSrc = oldSrc
      }
      next.unload()
    },
  })

  // fade in only once sound actually starts
  next.once('play', () => next.fade(0, volume, fadeMs))
  next.play()

  if (old) {
    old.fade(old.volume(), 0, fadeMs)
    unloadTimer = window.setTimeout(() => old.unload(), fadeMs + 100)
  }
  current = next
  currentSrc = src
}

export function setMuted(m: boolean) {
  muted = m
  Howler.mute(m)
}

export function isMuted() {
  return muted
}
