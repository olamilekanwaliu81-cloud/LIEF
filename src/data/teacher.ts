import { CLASS_GROUPS } from './grades'

export const teacher = {
  name: 'Mrs. Ngozi Okafor',
  id: 'TCH-0042',
  school: 'Federal Government College, Lagos',
  subjects: ['Mathematics', 'Basic Science & Technology'],
  classes: ['Primary 4', 'Primary 5'],
  email: 'n.okafor@fgclagos.edu.ng',
  phone: '+234 801 234 5678',
  joined: 'Sep 2024',
}

export type PerformanceStatus = 'excellent' | 'good' | 'average' | 'needs-attention' | 'critical'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface ScoreEntry { subject: string; score: number; term: string; maxScore: number }
export interface AttendanceEntry { date: string; status: AttendanceStatus }
export interface Assignment { id: string; title: string; subject: string; dueDate: string; submitted: boolean; score?: number }
export interface Announcement { id: string; title: string; body: string; date: string; classTarget: string }

export interface StudentRecord {
  id: string
  name: string
  class: string
  gender: 'M' | 'F'
  scores: ScoreEntry[]
  attendance: AttendanceEntry[]
  weaknesses: string[]
  strengths: string[]
  teacherNote: string
  lastUpdated: string
  status: PerformanceStatus
  assignments: Assignment[]
  parentName: string
  parentPhone: string
}

export const students: StudentRecord[] = [
  {
    id: 'STU-001', name: 'Amara Adeyemi', class: 'Primary 4', gender: 'F',
    parentName: 'Fatima Adeyemi', parentPhone: '+234 802 111 2222',
    scores: [
      { subject: 'English Language', score: 81, term: 'Second Term', maxScore: 100 },
      { subject: 'Mathematics', score: 62, term: 'Second Term', maxScore: 100 },
      { subject: 'Basic Science & Technology', score: 76, term: 'Second Term', maxScore: 100 },
      { subject: 'Social Studies', score: 70, term: 'Second Term', maxScore: 100 },
      { subject: 'Computer Studies / ICT', score: 85, term: 'Second Term', maxScore: 100 },
      { subject: 'Cultural & Creative Arts', score: 89, term: 'Second Term', maxScore: 100 },
    ],
    attendance: [
      { date: '2026-09-15', status: 'present' }, { date: '2026-09-16', status: 'present' },
      { date: '2026-09-17', status: 'absent' }, { date: '2026-09-18', status: 'present' },
      { date: '2026-09-19', status: 'late' }, { date: '2026-09-22', status: 'present' },
    ],
    weaknesses: ['Number operations', 'Word problems', 'Fractions'],
    strengths: ['Reading comprehension', 'Creative writing', 'Scientific observation'],
    teacherNote: 'Amara is a bright student who struggles with number operations. Recommend daily practice at home.',
    lastUpdated: 'Sep 18, 2026', status: 'average',
    assignments: [
      { id: 'A1', title: 'Maths worksheet — Fractions', subject: 'Mathematics', dueDate: 'Sep 20', submitted: false },
      { id: 'A2', title: 'English composition', subject: 'English Language', dueDate: 'Sep 17', submitted: true, score: 78 },
      { id: 'A3', title: 'Science lab report', subject: 'Basic Science & Technology', dueDate: 'Sep 15', submitted: true, score: 82 },
    ],
  },
  {
    id: 'STU-002', name: 'Chidi Okonkwo', class: 'Primary 4', gender: 'M',
    parentName: 'Emeka Okonkwo', parentPhone: '+234 803 222 3333',
    scores: [
      { subject: 'English Language', score: 74, term: 'Second Term', maxScore: 100 },
      { subject: 'Mathematics', score: 88, term: 'Second Term', maxScore: 100 },
      { subject: 'Basic Science & Technology', score: 90, term: 'Second Term', maxScore: 100 },
      { subject: 'Social Studies', score: 68, term: 'Second Term', maxScore: 100 },
      { subject: 'Computer Studies / ICT', score: 91, term: 'Second Term', maxScore: 100 },
      { subject: 'Cultural & Creative Arts', score: 72, term: 'Second Term', maxScore: 100 },
    ],
    attendance: [
      { date: '2026-09-15', status: 'present' }, { date: '2026-09-16', status: 'present' },
      { date: '2026-09-17', status: 'present' }, { date: '2026-09-18', status: 'present' },
      { date: '2026-09-19', status: 'present' }, { date: '2026-09-22', status: 'present' },
    ],
    weaknesses: ['Essay writing', 'Map reading (Social Studies)'],
    strengths: ['Mathematics', 'Science experiments', 'Problem solving'],
    teacherNote: 'Chidi excels in STEM subjects. Needs encouragement with language arts.',
    lastUpdated: 'Sep 17, 2026', status: 'good',
    assignments: [
      { id: 'A1', title: 'Maths worksheet — Fractions', subject: 'Mathematics', dueDate: 'Sep 20', submitted: true, score: 92 },
      { id: 'A2', title: 'English composition', subject: 'English Language', dueDate: 'Sep 17', submitted: true, score: 71 },
    ],
  },
  {
    id: 'STU-003', name: 'Fatima Bello', class: 'Primary 4', gender: 'F',
    parentName: 'Alhaji Bello', parentPhone: '+234 804 333 4444',
    scores: [
      { subject: 'English Language', score: 55, term: 'Second Term', maxScore: 100 },
      { subject: 'Mathematics', score: 45, term: 'Second Term', maxScore: 100 },
      { subject: 'Basic Science & Technology', score: 52, term: 'Second Term', maxScore: 100 },
      { subject: 'Social Studies', score: 60, term: 'Second Term', maxScore: 100 },
      { subject: 'Cultural & Creative Arts', score: 68, term: 'Second Term', maxScore: 100 },
    ],
    attendance: [
      { date: '2026-09-15', status: 'absent' }, { date: '2026-09-16', status: 'present' },
      { date: '2026-09-17', status: 'late' }, { date: '2026-09-18', status: 'absent' },
      { date: '2026-09-19', status: 'present' }, { date: '2026-09-22', status: 'present' },
    ],
    weaknesses: ['Reading fluency', 'Basic arithmetic', 'Attention in class', 'Homework completion'],
    strengths: ['Oral participation', 'Art activities'],
    teacherNote: 'Fatima needs significant support across all subjects. Parent meeting strongly recommended.',
    lastUpdated: 'Sep 16, 2026', status: 'critical',
    assignments: [
      { id: 'A1', title: 'Maths worksheet — Fractions', subject: 'Mathematics', dueDate: 'Sep 20', submitted: false },
      { id: 'A2', title: 'English composition', subject: 'English Language', dueDate: 'Sep 17', submitted: false },
    ],
  },
  {
    id: 'STU-004', name: 'Emeka Nwosu', class: 'Primary 4', gender: 'M',
    parentName: 'Mrs. Chioma Nwosu', parentPhone: '+234 805 444 5555',
    scores: [
      { subject: 'English Language', score: 91, term: 'Second Term', maxScore: 100 },
      { subject: 'Mathematics', score: 94, term: 'Second Term', maxScore: 100 },
      { subject: 'Basic Science & Technology', score: 88, term: 'Second Term', maxScore: 100 },
      { subject: 'Social Studies', score: 85, term: 'Second Term', maxScore: 100 },
      { subject: 'Computer Studies / ICT', score: 95, term: 'Second Term', maxScore: 100 },
    ],
    attendance: [
      { date: '2026-09-15', status: 'present' }, { date: '2026-09-16', status: 'present' },
      { date: '2026-09-17', status: 'present' }, { date: '2026-09-18', status: 'present' },
      { date: '2026-09-19', status: 'present' }, { date: '2026-09-22', status: 'present' },
    ],
    weaknesses: [],
    strengths: ['All-round performance', 'Class leadership', 'Consistent homework'],
    teacherNote: 'Emeka is performing excellently. Consider advanced challenges and class representative role.',
    lastUpdated: 'Sep 18, 2026', status: 'excellent',
    assignments: [
      { id: 'A1', title: 'Maths worksheet — Fractions', subject: 'Mathematics', dueDate: 'Sep 20', submitted: true, score: 96 },
    ],
  },
  {
    id: 'STU-005', name: 'Aisha Musa', class: 'Primary 4', gender: 'F',
    parentName: 'Musa Ibrahim', parentPhone: '+234 806 555 6666',
    scores: [
      { subject: 'English Language', score: 69, term: 'Second Term', maxScore: 100 },
      { subject: 'Mathematics', score: 71, term: 'Second Term', maxScore: 100 },
      { subject: 'Basic Science & Technology', score: 74, term: 'Second Term', maxScore: 100 },
      { subject: 'Social Studies', score: 72, term: 'Second Term', maxScore: 100 },
    ],
    attendance: [
      { date: '2026-09-15', status: 'present' }, { date: '2026-09-16', status: 'late' },
      { date: '2026-09-17', status: 'present' }, { date: '2026-09-18', status: 'present' },
      { date: '2026-09-19', status: 'excused' }, { date: '2026-09-22', status: 'present' },
    ],
    weaknesses: ['Confidence in class', 'Spelling'],
    strengths: ['Consistent effort', 'Group work', 'Science'],
    teacherNote: 'Aisha is a quiet but hardworking student. Needs encouragement to participate more in class.',
    lastUpdated: 'Sep 15, 2026', status: 'good',
    assignments: [
      { id: 'A2', title: 'English composition', subject: 'English Language', dueDate: 'Sep 17', submitted: true, score: 70 },
    ],
  },
]

export const announcements: Announcement[] = [
  {
    id: 'ANN-1',
    title: 'Second Term Examination Schedule',
    body: 'Second term exams begin Monday 28 September. All students must bring their exam cards. No lateness will be tolerated.',
    date: 'Sep 20, 2026',
    classTarget: 'Primary 4',
  },
  {
    id: 'ANN-2',
    title: 'Mathematics Revision Class',
    body: 'Extra revision class for Mathematics holds this Saturday, 8am – 10am in Room 4B. All students are encouraged to attend.',
    date: 'Sep 18, 2026',
    classTarget: 'Primary 4',
  },
]

export const statusConfig: Record<PerformanceStatus, { label: string; color: string; bg: string; border: string }> = {
  excellent:           { label: 'Excellent',       color: '#0F8A5F', bg: '#E8F8F3', border: '#A8EDDA' },
  good:                { label: 'Good',            color: '#1363A1', bg: '#E4F1F8', border: '#A8D0EE' },
  average:             { label: 'Average',         color: '#7B5EA7', bg: '#F3EEF8', border: '#D3C0EE' },
  'needs-attention':   { label: 'Needs Attention', color: '#B07000', bg: '#FFF8E7', border: '#F5DC8A' },
  critical:            { label: 'Critical',        color: '#C0521A', bg: '#FFF0EA', border: '#F5C5A0' },
}
