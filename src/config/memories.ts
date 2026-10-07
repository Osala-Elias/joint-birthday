// Photos live in public/photos/memories as 01.webp ... 06.webp
// Order: Elias (2), both of them (2), Virginia (2)
export interface Memory {
  src: string
  date: string
  caption: string
}

export const memories: Memory[] = [
  {
    src: `${import.meta.env.BASE_URL}assets-original/photos/memories/elias2.jpeg`,
    date: 'ELIAS · 7 OCTOBER',
    caption: "A year older, and still the one who makes every day feel lighter.",
  },
  {
    src: `${import.meta.env.BASE_URL}assets-original/photos/memories/elias1.jpeg`,
    date: 'ELIAS · 7 OCTOBER',
    caption: "Here's to the laughter, the kindness, and everything good the new year holds.",
  },
  {
    src: `${import.meta.env.BASE_URL}assets-original/photos/memories/both1.jpeg`,
    date: 'TOGETHER',
    caption: "Two kindred spirits, one frame, and birthdays just a day apart.",
  },
  {
    src: `${import.meta.env.BASE_URL}assets-original/photos/memories/both2.jpeg`,
    date: 'TOGETHER',
    caption: "Different paths, the same joy whenever we are side by side.",
  },
  {
    src: `${import.meta.env.BASE_URL}assets-original/photos/memories/virginia2.jpeg`,
    date: 'VIRGINIA · 8 OCTOBER',
    caption: "Grace, warmth, and a smile that changes the whole room.",
  },
  {
    src: `${import.meta.env.BASE_URL}assets-original/photos/memories/virginia3.jpeg`,
    date: 'VIRGINIA · 8 OCTOBER',
    caption: "A new year, a new chapter, and so much beautiful ahead.",
  },
]
