export type LeadScore = 'Hot' | 'Warm' | 'Cold'

export type PipelineStage =
  | 'New Lead'
  | 'Contacted'
  | 'Consultation Scheduled'
  | 'Documents Requested'
  | 'Documents Received'
  | 'University Applied'
  | 'Admission Received'
  | 'Scholarship Awarded'
  | 'Visa Preparation'
  | 'Visa Interview'
  | 'Visa Approved'
  | 'Travel Completed'

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  telegram: string
  telegramChatId?: string
  instagram: string
  country: string
  city: string
  age: number
  school: string
  gpa: number
  ielts: number
  duolingo?: number
  sat?: number
  englishWaiver: boolean
  major: string
  preferredUniversities: string[]
  preferredCountry: string
  intake: 'Spring' | 'Fall'
  budget: number
  parentName: string
  parentPhone: string
  sponsorName?: string
  passportStatus: 'Valid' | 'Expired' | 'In Process' | 'Not Started'
  notes: string
  counselor: string
  status: PipelineStage
  leadScore: LeadScore
  enrollmentProbability: number
  nextAction: string
  lastContact: string
  createdAt: string
  photo?: string
  tags: string[]
}

export interface Counselor {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Counselor'
  avatar?: string
  studentsAssigned: number
  callsCompleted: number
  contractsSigned: number
  revenue: number
  conversionRate: number
}

export const PIPELINE_STAGES: PipelineStage[] = [
  'New Lead',
  'Contacted',
  'Consultation Scheduled',
  'Documents Requested',
  'Documents Received',
  'University Applied',
  'Admission Received',
  'Scholarship Awarded',
  'Visa Preparation',
  'Visa Interview',
  'Visa Approved',
  'Travel Completed',
]


export const MONTHLY_LEADS = [
  { month: 'Jan', leads: 42, enrolled: 28 },
  { month: 'Feb', leads: 58, enrolled: 35 },
  { month: 'Mar', leads: 75, enrolled: 52 },
  { month: 'Apr', leads: 91, enrolled: 61 },
  { month: 'May', leads: 83, enrolled: 57 },
  { month: 'Jun', leads: 110, enrolled: 78 },
]

export const COUNSELOR_PERFORMANCE = [
  { name: 'Dilnoza', students: 34, contracts: 28, revenue: 84 },
  { name: 'Jasur T.', students: 28, contracts: 21, revenue: 63 },
  { name: 'Nilufar', students: 22, contracts: 17, revenue: 51 },
  { name: 'Bobur', students: 19, contracts: 13, revenue: 39 },
]

export const AI_TASKS = [
  { id: 't1', priority: 'high', student: 'Azizbek Nazarov', action: 'Has not replied in 5 days — follow up immediately', dueDate: 'Today', done: false },
  { id: 't2', priority: 'high', student: 'Jasur Rahimov', action: 'Documents incomplete — request financial statements', dueDate: 'Today', done: false },
  { id: 't3', priority: 'medium', student: 'Muhammad Sobirov', action: 'Schedule visa interview practice session', dueDate: 'Tomorrow', done: false },
  { id: 't4', priority: 'high', student: 'Dilshod Umarov', action: 'Application deadline approaching — remind about passport', dueDate: 'Today', done: false },
  { id: 't5', priority: 'medium', student: 'Zulfiya Karimova', action: 'Admission received — confirm enrollment decision', dueDate: 'Jul 2', done: false },
  { id: 't6', priority: 'low', student: 'Otabek Yuldashev', action: 'Send Netherlands university brochure', dueDate: 'Jul 3', done: false },
]

export const CALENDAR_EVENTS = [
  { id: 'e1', title: 'Azizbek — Consultation Call', type: 'call', date: '2026-06-30', time: '10:00 AM', student: 'Azizbek Nazarov' },
  { id: 'e2', title: 'Muhammad — Visa Practice', type: 'meeting', date: '2026-06-30', time: '2:00 PM', student: 'Muhammad Sobirov' },
  { id: 'e3', title: 'UC Berkeley Application Deadline', type: 'deadline', date: '2026-07-01', time: 'All day', student: 'Azizbek Nazarov' },
  { id: 'e4', title: 'Zulfiya — UK Visa Interview', type: 'interview', date: '2026-07-03', time: '9:00 AM', student: 'Zulfiya Karimova' },
  { id: 'e5', title: 'Jasur R. — Document Review', type: 'meeting', date: '2026-07-04', time: '11:00 AM', student: 'Jasur Rahimov' },
]

export const NOTIFICATIONS = [
  { id: 'n1', type: 'reply', message: 'Zulfiya Karimova replied to your message', time: '5 min ago', read: false },
  { id: 'n2', type: 'overdue', message: 'Follow-up overdue for Dilshod Umarov (5 days)', time: '1 hour ago', read: false },
  { id: 'n3', type: 'deadline', message: 'UC Berkeley deadline in 2 days — Azizbek Nazarov', time: '2 hours ago', read: false },
  { id: 'n4', type: 'document', message: 'Missing financial docs for Otabek Yuldashev', time: '3 hours ago', read: true },
  { id: 'n5', type: 'visa', message: 'Visa appointment confirmed for Muhammad Sobirov', time: '1 day ago', read: true },
]
