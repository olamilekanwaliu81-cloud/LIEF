export const CLASS_GROUPS = [
  {
    group: 'Nursery',
    classes: ['Nursery 1', 'Nursery 2'],
    subjects: [
      'English Language (Phonics)',
      'Numeracy (Number Work)',
      'Verbal Reasoning',
      'Quantitative Reasoning',
      'Social Habits',
      'Creative & Cultural Arts',
      'Music & Movement',
      'Christian Religious Knowledge / Islamic Studies',
      'Physical Education',
      'Personal Development',
    ],
  },
  {
    group: 'Primary (1–3)',
    classes: ['Primary 1', 'Primary 2', 'Primary 3'],
    subjects: [
      'English Language',
      'Mathematics',
      'Basic Science & Technology',
      'Social Studies',
      'Civic Education',
      'Cultural & Creative Arts',
      'Christian Religious Knowledge / Islamic Religious Studies',
      'Physical & Health Education',
      'Verbal Reasoning',
      'Quantitative Reasoning',
    ],
  },
  {
    group: 'Primary (4–5)',
    classes: ['Primary 4', 'Primary 5'],
    subjects: [
      'English Language',
      'Mathematics',
      'Basic Science & Technology',
      'Social Studies',
      'Civic Education',
      'Agricultural Science',
      'Computer Studies / ICT',
      'Cultural & Creative Arts',
      'Home Economics',
      'Physical & Health Education',
      'Christian Religious Knowledge / Islamic Religious Studies',
    ],
  },
]

export const ALL_CLASSES = CLASS_GROUPS.flatMap(g => g.classes)

export const getSubjectsForClass = (className: string): string[] => {
  const group = CLASS_GROUPS.find(g => g.classes.includes(className))
  return group?.subjects ?? CLASS_GROUPS[1].subjects
}
