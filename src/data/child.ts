export const child = {
  name: 'Amara',
  age: 10,
  grade: 'Primary 4',
  school: 'Greenfield Primary School',
  avatar: 'A',
  overallScore: 74,
  attendanceRate: 92,
  lastUpdated: 'Sep 18, 2026',
}

export const subjects = [
  { name: 'Mathematics', score: 62, trend: -4, status: 'concern' as const },
  { name: 'English', score: 81, trend: +3, status: 'strength' as const },
  { name: 'Science', score: 76, trend: +5, status: 'strength' as const },
  { name: 'Social Studies', score: 70, trend: 0, status: 'neutral' as const },
  { name: 'Art & Design', score: 89, trend: +7, status: 'strength' as const },
  { name: 'Physical Ed.', score: 85, trend: +2, status: 'strength' as const },
]

export const journeyData = [
  { term: 'Jan', Math: 68, English: 75, Science: 70, overall: 71 },
  { term: 'Feb', Math: 65, English: 77, Science: 72, overall: 71 },
  { term: 'Mar', Math: 60, English: 79, Science: 74, overall: 71 },
  { term: 'Apr', Math: 63, English: 80, Science: 75, overall: 73 },
  { term: 'May', Math: 61, English: 80, Science: 76, overall: 72 },
  { term: 'Jun', Math: 64, English: 82, Science: 77, overall: 74 },
  { term: 'Jul', Math: 62, English: 81, Science: 76, overall: 73 },
  { term: 'Aug', Math: 60, English: 83, Science: 78, overall: 74 },
  { term: 'Sep', Math: 62, English: 81, Science: 76, overall: 74 },
]

export const recentActivity = [
  { date: 'Sep 18', subject: 'Mathematics', type: 'Assessment', result: '58/100', flag: true },
  { date: 'Sep 16', subject: 'English', type: 'Reading task', result: 'Completed', flag: false },
  { date: 'Sep 15', subject: 'Science', type: 'Lab report', result: '79/100', flag: false },
  { date: 'Sep 13', subject: 'Mathematics', type: 'Homework', result: 'Missing', flag: true },
  { date: 'Sep 11', subject: 'Art & Design', type: 'Project', result: '91/100', flag: false },
]

export const supportGuidance: Record<string, {
  subject: string
  concern: string
  actions: { title: string; description: string; time: string }[]
}> = {
  Mathematics: {
    subject: 'Mathematics',
    concern: 'Amara\'s maths score has dipped to 62 and a recent assessment flagged gaps in number operations.',
    actions: [
      {
        title: 'Practice number bonds daily',
        description: 'Spend 10 minutes before dinner on addition and subtraction flashcards. Focus on numbers up to 20.',
        time: '10 min/day',
      },
      {
        title: 'Use real-world maths',
        description: 'Involve Amara when cooking or shopping — count change, measure ingredients, estimate quantities.',
        time: '15 min, 3×/week',
      },
      {
        title: 'Ask her teacher for focus areas',
        description: 'Request a brief note from Amara\'s teacher on which specific operations need the most attention.',
        time: 'One conversation',
      },
    ],
  },
  English: {
    subject: 'English',
    concern: 'Amara is performing well in English and reading consistently.',
    actions: [
      {
        title: 'Read together each night',
        description: 'Even 15 minutes of shared reading builds vocabulary and fluency. Let Amara choose the book.',
        time: '15 min/night',
      },
      {
        title: 'Encourage story writing',
        description: 'Ask Amara to write a short story about something she enjoyed this week. Celebrate creativity.',
        time: 'Weekends',
      },
    ],
  },
}
