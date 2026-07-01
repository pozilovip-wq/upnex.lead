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

export const MOCK_COUNSELORS: Counselor[] = [
  { id: 'c1', name: 'Dilnoza Yusupova', email: 'dilnoza@upnex.ai', role: 'Manager', studentsAssigned: 34, callsCompleted: 120, contractsSigned: 28, revenue: 84000, conversionRate: 82 },
  { id: 'c2', name: 'Jasur Toshmatov', email: 'jasur@upnex.ai', role: 'Counselor', studentsAssigned: 28, callsCompleted: 95, contractsSigned: 21, revenue: 63000, conversionRate: 75 },
  { id: 'c3', name: 'Nilufar Karimova', email: 'nilufar@upnex.ai', role: 'Counselor', studentsAssigned: 22, callsCompleted: 78, contractsSigned: 17, revenue: 51000, conversionRate: 77 },
  { id: 'c4', name: 'Bobur Mirzayev', email: 'bobur@upnex.ai', role: 'Counselor', studentsAssigned: 19, callsCompleted: 65, contractsSigned: 13, revenue: 39000, conversionRate: 68 },
]

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1', name: 'Azizbek Nazarov', email: 'azizbek@gmail.com', phone: '+998901234567',
    telegram: '@azizbek_n', instagram: '@azizbek.n', country: 'Uzbekistan', city: 'Tashkent',
    age: 19, school: 'Tashkent School #45', gpa: 3.8, ielts: 7.0, sat: 1320,
    englishWaiver: false, major: 'Computer Science', preferredUniversities: ['UC Berkeley', 'NYU', 'Boston University'],
    preferredCountry: 'USA', intake: 'Fall', budget: 40000, parentName: 'Nazarov Baxtiyor',
    parentPhone: '+998901234500', passportStatus: 'Valid', notes: 'Very motivated student. Interested in scholarships.',
    counselor: 'Dilnoza Yusupova', status: 'Documents Requested', leadScore: 'Hot',
    enrollmentProbability: 87, nextAction: 'Follow up on transcript submission',
    lastContact: '2026-06-25', createdAt: '2026-05-10', tags: ['Scholarship', 'CS', 'USA'],
  },
  {
    id: 's2', name: 'Jasur Rahimov', email: 'jasur.r@gmail.com', phone: '+998907654321',
    telegram: '@jasur_r', instagram: '@jasur.rahimov', country: 'Uzbekistan', city: 'Samarkand',
    age: 20, school: 'Samarkand Lyceum', gpa: 3.5, ielts: 6.5, englishWaiver: false,
    major: 'Business Administration', preferredUniversities: ['University of Toronto', 'McGill University'],
    preferredCountry: 'Canada', intake: 'Spring', budget: 35000, parentName: 'Rahimov Sanjar',
    parentPhone: '+998907654300', passportStatus: 'In Process', notes: 'Documents partially submitted. Needs IELTS retake.',
    counselor: 'Jasur Toshmatov', status: 'Consultation Scheduled', leadScore: 'Warm',
    enrollmentProbability: 62, nextAction: 'Schedule IELTS retake consultation',
    lastContact: '2026-06-20', createdAt: '2026-05-18', tags: ['Business', 'Canada'],
  },
  {
    id: 's3', name: 'Muhammad Sobirov', email: 'muhammad.s@gmail.com', phone: '+998901112233',
    telegram: '@muhammad_sob', instagram: '', country: 'Uzbekistan', city: 'Namangan',
    age: 21, school: 'Namangan State University', gpa: 3.9, ielts: 7.5, sat: 1400,
    englishWaiver: false, major: 'Medicine', preferredUniversities: ['Johns Hopkins', 'Harvard Medical', 'Georgetown'],
    preferredCountry: 'USA', intake: 'Fall', budget: 60000, parentName: 'Sobirov Ali',
    parentPhone: '+998901112200', passportStatus: 'Valid',
    notes: 'Exceptional student. Applied to top medical programs.',
    counselor: 'Dilnoza Yusupova', status: 'Visa Preparation', leadScore: 'Hot',
    enrollmentProbability: 94, nextAction: 'Schedule visa interview practice',
    lastContact: '2026-06-28', createdAt: '2026-03-15', tags: ['Medicine', 'USA', 'Top University'],
  },
  {
    id: 's4', name: 'Dilshod Umarov', email: 'dilshod.u@gmail.com', phone: '+998903334455',
    telegram: '@dilshod_u', instagram: '@dilshod.umarov', country: 'Uzbekistan', city: 'Bukhara',
    age: 18, school: 'Bukhara School #12', gpa: 3.2, ielts: 6.0, englishWaiver: false,
    major: 'Engineering', preferredUniversities: ['Purdue University', 'Ohio State'],
    preferredCountry: 'USA', intake: 'Fall', budget: 30000, parentName: 'Umarov Hamid',
    parentPhone: '+998903334400', passportStatus: 'Not Started',
    notes: 'Application deadline approaching. Passport needs to be started.',
    counselor: 'Nilufar Karimova', status: 'New Lead', leadScore: 'Cold',
    enrollmentProbability: 35, nextAction: 'Remind about passport application deadline',
    lastContact: '2026-06-15', createdAt: '2026-06-01', tags: ['Engineering', 'USA'],
  },
  {
    id: 's5', name: 'Zulfiya Karimova', email: 'zulfiya.k@gmail.com', phone: '+998905556677',
    telegram: '@zulfiya_k', instagram: '@zulfiya.k', country: 'Uzbekistan', city: 'Tashkent',
    age: 20, school: 'Westminster University Tashkent', gpa: 3.7, ielts: 7.0, duolingo: 115,
    englishWaiver: false, major: 'International Relations', preferredUniversities: ['LSE', 'Kings College', 'UCL'],
    preferredCountry: 'UK', intake: 'Fall', budget: 45000, parentName: 'Karimov Shohruh',
    parentPhone: '+998905556600', passportStatus: 'Valid',
    notes: 'Very organized. All documents submitted on time.',
    counselor: 'Dilnoza Yusupova', status: 'Admission Received', leadScore: 'Hot',
    enrollmentProbability: 91, nextAction: 'Review admission offer and confirm enrollment',
    lastContact: '2026-06-29', createdAt: '2026-04-02', tags: ['UK', 'Scholarship', 'IR'],
  },
  {
    id: 's6', name: 'Otabek Yuldashev', email: 'otabek.y@gmail.com', phone: '+998907778899',
    telegram: '@otabek_y', instagram: '', country: 'Uzbekistan', city: 'Fergana',
    age: 22, school: 'Fergana Polytechnic', gpa: 3.4, ielts: 6.5, englishWaiver: false,
    major: 'Data Science', preferredUniversities: ['University of Amsterdam', 'TU Delft'],
    preferredCountry: 'Netherlands', intake: 'Spring', budget: 28000, parentName: 'Yuldashev Bahodir',
    parentPhone: '+998907778800', passportStatus: 'Valid',
    notes: 'Interested in Netherlands programs. Needs financial documents.',
    counselor: 'Bobur Mirzayev', status: 'Contacted', leadScore: 'Warm',
    enrollmentProbability: 58, nextAction: 'Request bank statements and sponsor letter',
    lastContact: '2026-06-22', createdAt: '2026-05-25', tags: ['Netherlands', 'Data Science'],
  },
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
