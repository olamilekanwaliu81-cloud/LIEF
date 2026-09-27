import type { SubjectSummary } from './academics'

export interface GuidanceAction { title: string; description: string; time: string }

interface Category {
  match: RegExp
  concern: GuidanceAction[]
  strength: GuidanceAction[]
}

// Practical, low-cost actions a parent can take at home. Deliberately
// non-diagnostic (PRD §14): they suggest support, never label the child.
const CATEGORIES: Category[] = [
  {
    match: /math|numeracy|quantitative/i,
    concern: [
      { title: 'Practise number facts daily', description: 'Spend 10 minutes before dinner on addition, subtraction and times-table flashcards. Paper cards work as well as apps — keep it short and upbeat.', time: '10 min/day' },
      { title: 'Use real-world maths', description: 'Involve your child when cooking or shopping — counting change, measuring ingredients, estimating how many items fit in a bag.', time: '15 min, 3×/week' },
      { title: 'Talk through word problems', description: 'Read a word problem aloud together and ask "What is the question asking?" before any calculation. Drawing the problem helps.', time: '2 short sessions/week' },
      { title: 'Ask the teacher for focus areas', description: 'Request a brief note on which specific topics need the most attention, so home practice matches classwork.', time: 'One conversation' },
    ],
    strength: [
      { title: 'Offer puzzle challenges', description: 'Logic puzzles, Sudoku or ayo (mancala) stretch strong maths thinkers without extra worksheets.', time: 'Weekends' },
      { title: 'Let them teach you', description: 'Ask your child to explain how they solved a problem. Explaining deepens understanding.', time: '5 min, 2×/week' },
    ],
  },
  {
    match: /english|phonics|verbal|literature|reading/i,
    concern: [
      { title: 'Read together each night', description: 'Even 15 minutes of shared reading builds vocabulary and fluency. Let your child choose the book; take turns reading pages aloud.', time: '15 min/night' },
      { title: 'Build a word wall', description: 'Stick three new words a week on the fridge. Use them in conversation and praise your child when they use them.', time: '5 min/day' },
      { title: 'Short daily writing', description: 'Ask for three sentences about their day in a notebook. Focus on ideas first, spelling second.', time: '10 min/day' },
    ],
    strength: [
      { title: 'Encourage story writing', description: 'Ask your child to write a short story about something they enjoyed this week. Celebrate creativity.', time: 'Weekends' },
      { title: 'Visit a library together', description: 'Let them choose harder books. A library card is a free way to keep a strong reader growing.', time: 'Once a month' },
    ],
  },
  {
    match: /science|physics|chemistry|biology/i,
    concern: [
      { title: 'Ask "why" questions', description: 'Turn everyday moments into science: why does water boil, why do plants lean to the light? Look up answers together.', time: '10 min, 3×/week' },
      { title: 'Try a kitchen experiment', description: 'Simple experiments (dissolving salt vs sugar, growing beans in cotton wool) make topics concrete and memorable.', time: '30 min/week' },
      { title: 'Review key vocabulary', description: 'Science uses lots of new words. Make flashcards from the class notebook and quiz each other.', time: '10 min, 2×/week' },
    ],
    strength: [
      { title: 'Keep a nature journal', description: 'Record observations about weather, plants or insects. It builds on curiosity your child already shows.', time: '10 min/day' },
    ],
  },
  {
    match: /social|civic|government|economics/i,
    concern: [
      { title: 'Discuss the news together', description: 'Pick one local news story a week and talk about who is involved and why it matters to your community.', time: '15 min/week' },
      { title: 'Use maps at home', description: 'Look at a map of Nigeria or your state together; find places mentioned in class or in the news.', time: '10 min/week' },
    ],
    strength: [
      { title: 'Explore family history', description: 'Ask your child to interview a grandparent about how life has changed. It connects social studies to real life.', time: 'One weekend' },
    ],
  },
  {
    match: /computer|ict/i,
    concern: [
      { title: 'Practise typing and basics', description: 'Free typing games and simple file tasks build confidence. Short, supervised sessions work best.', time: '15 min, 2×/week' },
      { title: 'Talk about online safety', description: 'Discuss what information should stay private online. It is part of the curriculum and important at home.', time: 'One conversation' },
    ],
    strength: [
      { title: 'Try beginner coding', description: 'Free block-coding activities let a strong ICT learner build simple games and animations.', time: '30 min/week' },
    ],
  },
  {
    match: /art|music|creative|cultural/i,
    concern: [
      { title: 'Create together', description: 'Drawing, singing or crafting with recycled materials — the goal is enjoyment and effort, not perfection.', time: '20 min/week' },
    ],
    strength: [
      { title: 'Display their work', description: 'Put artwork on the wall or share it with family. Recognition builds confidence that carries into other subjects.', time: 'Ongoing' },
    ],
  },
  {
    match: /physical|health|pe\b/i,
    concern: [
      { title: 'Move together', description: 'A family walk, dancing or skipping after school builds fitness and routine.', time: '20 min, 3×/week' },
    ],
    strength: [
      { title: 'Support a sport or club', description: 'If the school offers sports clubs, encourage your child to join — it builds teamwork too.', time: 'Weekly' },
    ],
  },
]

const GENERIC: Category = {
  match: /.*/,
  concern: [
    { title: 'Review class notes together', description: 'Ask your child to show you what they learned this week and explain one idea in their own words.', time: '10 min, 3×/week' },
    { title: 'Set a regular homework time', description: 'A consistent, quiet time and place for homework helps children keep up without last-minute stress.', time: 'Daily' },
    { title: 'Ask the teacher for focus areas', description: 'Request a brief note on which topics need attention so home practice matches classwork.', time: 'One conversation' },
  ],
  strength: [
    { title: 'Celebrate the effort', description: 'Tell your child specifically what you noticed they did well. Praise effort, not just results.', time: 'Ongoing' },
  ],
}

const categoryFor = (subject: string) => CATEGORIES.find(c => c.match.test(subject)) ?? GENERIC

export interface Guidance {
  tone: 'concern' | 'neutral' | 'strength'
  context: string
  actions: GuidanceAction[]
}

/** Guidance tied to the child's actual data for one subject (FR-06, FR-08). */
export function guidanceFor(childName: string, subject: SubjectSummary, teacherFlags: string[]): Guidance {
  const cat = categoryFor(subject.name)
  const trendText = subject.trend < 0
    ? `down ${Math.abs(subject.trend)} points since the last update`
    : subject.trend > 0 ? `up ${subject.trend} points since the last update` : 'steady since the last update'
  const flags = teacherFlags.length ? ` Their teacher has noted: ${teacherFlags.join(', ').toLowerCase()}.` : ''

  if (subject.status === 'concern') {
    return {
      tone: 'concern',
      context: `${childName}'s ${subject.name} score is ${subject.score}/100, ${trendText}.${flags} These steps can help at home.`,
      actions: cat.concern,
    }
  }
  if (subject.status === 'strength') {
    return {
      tone: 'strength',
      context: `${childName} is doing well in ${subject.name} — ${subject.score}/100, ${trendText}. Here are ways to keep that momentum going.`,
      actions: [...cat.strength, ...GENERIC.strength].slice(0, 3),
    }
  }
  return {
    tone: 'neutral',
    context: `${childName}'s ${subject.name} score is ${subject.score}/100, ${trendText}. A little regular support can move it into a strength.`,
    actions: cat.concern.slice(0, 2).concat(cat.strength.slice(0, 1)),
  }
}

/** Teacher-flagged weak areas that plausibly belong to this subject. */
export function flagsForSubject(subject: string, weaknesses: string[]) {
  const cat = categoryFor(subject)
  const keywords: Record<string, RegExp> = {
    math: /number|fraction|arithmetic|word problem|times|division|multiplic|maths?/i,
    english: /read|spell|writ|essay|grammar|comprehension|phonics|vocab/i,
    science: /science|experiment|observation/i,
    social: /map|social|civic/i,
  }
  const key = cat === CATEGORIES[0] ? 'math' : cat === CATEGORIES[1] ? 'english' : cat === CATEGORIES[2] ? 'science' : cat === CATEGORIES[3] ? 'social' : null
  if (!key) return []
  return weaknesses.filter(w => keywords[key].test(w))
}
