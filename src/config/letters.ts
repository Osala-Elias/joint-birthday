import { experience } from './experience'

export interface Letter {
  id: string
  from: string
  to: string
  text: string
}

const { him, her } = experience.kindred_spirits

// DRAFTS: replace the text of both with your own words.
export const letters: Letter[] = [
  {
    id: 'to-her',
    from: him.name,
    to: her.name,
    text: `Dear Virginia,

Happy birthday.

I keep thinking about how much can change in two years. There have been easy days and difficult ones, moments when everything felt simple and others when we had to choose, again and again, to keep going. Somehow, through all the ups and downs, we’re still here — still learning each other, still growing, and still finding our way back to what matters.

I’m grateful for the time we’ve shared and for all the little moments, even the imperfect ones, that have become part of our story. I hope this new year of your life brings you more peace, more laughter, and more reasons to be proud of the person you’re becoming.

And for us, I hope we keep choosing each other through whatever comes next — not because everything will always be easy, but because what we have is worth holding onto.

Happy birthday. Here’s to you, to everything you’ve become, and quietly, to the two years we’ve made it through together.

Elias
`,
  },
  {
    id: 'to-him',
    from: her.name,
    to: him.name,
    text: `Dear Elias,

Happy belated birthday.

One of the things I appreciate most about you is your patience. You have a way of giving me room to be myself, even when I’m not at my best, and somehow you always seem to know when I need a little more understanding instead of a lot of words.

You’ve been there for me in the good moments, but even more importantly, you’ve been there when things weren’t so easy. When I’ve needed someone, you’ve shown up. Sometimes with the right words, sometimes with nothing more than your presence, but somehow, you always turn up. And I don’t think I say enough how much that means to me.

Over time, I’ve come to realize that being there for someone isn’t always about grand gestures. It’s the consistency, the checking in, the patience, the small things you do without being asked. Those are the things I notice, and those are the things I’ll always appreciate about you.

Thank you for being someone I can count on, for giving me grace when I need it, and for staying through both the good days and the difficult ones.

I hope this new year brings you the same kind of kindness and patience you’ve given me so freely. You deserve to be celebrated, not just today, but for all the ways you show up for the people you love.

Happy birthday.

Virginia
`,
  },
]
