'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Student, MOCK_STUDENTS, AI_TASKS, PipelineStage } from './data'

export interface Task {
  id: string
  priority: 'high' | 'medium' | 'low'
  student: string
  action: string
  dueDate: string
  done: boolean
}

export interface DocEntry {
  status: 'uploaded' | 'pending' | 'missing'
  filename?: string
  uploadedAt?: string
}

// keyed by studentId → docType → DocEntry
export type DocStore = Record<string, Record<string, DocEntry>>

export interface AppNotification {
  id: string
  studentId: string
  studentName: string
  type: 'missing_docs'
  missingDocs: string[]
  createdAt: string
  read: boolean
  telegramText: string
}

export const DOC_TYPES = [
  'Passport', 'Diploma', 'Transcript', 'English Certificate',
  'Financial Documents', 'DS-160', 'I-20', 'Visa', 'Offer Letter',
]

const INITIAL_DOCS: DocStore = {
  's1': { 'Passport': { status: 'uploaded' }, 'Diploma': { status: 'uploaded' }, 'Transcript': { status: 'pending' }, 'English Certificate': { status: 'uploaded' }, 'Financial Documents': { status: 'missing' }, 'DS-160': { status: 'missing' }, 'I-20': { status: 'missing' }, 'Visa': { status: 'missing' }, 'Offer Letter': { status: 'missing' } },
  's2': { 'Passport': { status: 'pending' }, 'Diploma': { status: 'uploaded' }, 'Transcript': { status: 'missing' }, 'English Certificate': { status: 'uploaded' }, 'Financial Documents': { status: 'missing' }, 'DS-160': { status: 'missing' }, 'I-20': { status: 'missing' }, 'Visa': { status: 'missing' }, 'Offer Letter': { status: 'missing' } },
  's3': { 'Passport': { status: 'uploaded' }, 'Diploma': { status: 'uploaded' }, 'Transcript': { status: 'uploaded' }, 'English Certificate': { status: 'uploaded' }, 'Financial Documents': { status: 'uploaded' }, 'DS-160': { status: 'uploaded' }, 'I-20': { status: 'uploaded' }, 'Visa': { status: 'pending' }, 'Offer Letter': { status: 'uploaded' } },
  's4': { 'Passport': { status: 'missing' }, 'Diploma': { status: 'missing' }, 'Transcript': { status: 'missing' }, 'English Certificate': { status: 'missing' }, 'Financial Documents': { status: 'missing' }, 'DS-160': { status: 'missing' }, 'I-20': { status: 'missing' }, 'Visa': { status: 'missing' }, 'Offer Letter': { status: 'missing' } },
  's5': { 'Passport': { status: 'uploaded' }, 'Diploma': { status: 'uploaded' }, 'Transcript': { status: 'uploaded' }, 'English Certificate': { status: 'uploaded' }, 'Financial Documents': { status: 'uploaded' }, 'DS-160': { status: 'missing' }, 'I-20': { status: 'missing' }, 'Visa': { status: 'missing' }, 'Offer Letter': { status: 'uploaded' } },
  's6': { 'Passport': { status: 'uploaded' }, 'Diploma': { status: 'uploaded' }, 'Transcript': { status: 'pending' }, 'English Certificate': { status: 'uploaded' }, 'Financial Documents': { status: 'missing' }, 'DS-160': { status: 'missing' }, 'I-20': { status: 'missing' }, 'Visa': { status: 'missing' }, 'Offer Letter': { status: 'missing' } },
}

interface StoreState {
  students: Student[]
  tasks: Task[]
  docs: DocStore
  notifications: AppNotification[]
  addStudent: (s: Omit<Student, 'id' | 'createdAt' | 'leadScore' | 'enrollmentProbability' | 'nextAction' | 'tags'>) => void
  updateStudent: (id: string, updates: Partial<Student>) => void
  deleteStudent: (id: string) => void
  moveStudent: (id: string, stage: PipelineStage) => void
  toggleTask: (id: string) => void
  setDocStatus: (studentId: string, docType: string, status: DocEntry['status'], filename?: string) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

const Store = createContext<StoreState | null>(null)

function scoreStudent(s: Partial<Student>): { leadScore: 'Hot' | 'Warm' | 'Cold'; enrollmentProbability: number; nextAction: string } {
  const gpa = s.gpa ?? 0
  const ielts = s.ielts ?? 0
  const budget = s.budget ?? 0
  const score = (gpa / 4) * 35 + (Math.min(ielts, 9) / 9) * 30 + (Math.min(budget, 60000) / 60000) * 35
  const pct = Math.round(score)
  const leadScore = pct >= 70 ? 'Hot' : pct >= 45 ? 'Warm' : 'Cold'
  const actions: Record<PipelineStage, string> = {
    'New Lead': 'Call student within 24 hours and introduce our services',
    'Contacted': 'Schedule an initial consultation call this week',
    'Consultation Scheduled': 'Prepare university list and scholarship options',
    'Documents Requested': 'Follow up daily on missing documents',
    'Documents Received': 'Review documents and prepare university applications',
    'University Applied': 'Monitor application status, follow up with universities weekly',
    'Admission Received': 'Review offer letter and confirm enrollment decision',
    'Scholarship Awarded': 'Start visa application immediately',
    'Visa Preparation': 'Schedule DS-160 and visa interview practice',
    'Visa Interview': 'Coach student before interview, debrief after',
    'Visa Approved': 'Send congratulations, arrange pre-departure orientation',
    'Travel Completed': 'Check in after arrival, request referrals',
  }
  return { leadScore, enrollmentProbability: pct, nextAction: actions[s.status ?? 'New Lead'] }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function buildMissingNotification(studentId: string, studentName: string, missingDocs: string[]): AppNotification {
  const firstName = studentName.split(' ')[0]
  const telegramText = `Hi ${firstName}! 👋\n\nWe noticed that your file is still missing the following documents:\n\n${missingDocs.map(d => `• ${d}`).join('\n')}\n\nPlease send them as soon as possible so we can continue processing your application.\n\nThank you,\nUpnex Education Team`
  return {
    id: `notif_${studentId}_${Date.now()}`,
    studentId,
    studentName,
    type: 'missing_docs',
    missingDocs,
    createdAt: new Date().toISOString(),
    read: false,
    telegramText,
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage<Student[]>('upnex_students', MOCK_STUDENTS))
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage<Task[]>('upnex_tasks', AI_TASKS as Task[]))
  const [docs, setDocs] = useState<DocStore>(() => loadFromStorage<DocStore>('upnex_docs', INITIAL_DOCS))
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadFromStorage<AppNotification[]>('upnex_notifications', []))

  useEffect(() => { saveToStorage('upnex_students', students) }, [students])
  useEffect(() => { saveToStorage('upnex_tasks', tasks) }, [tasks])
  useEffect(() => { saveToStorage('upnex_docs', docs) }, [docs])
  useEffect(() => { saveToStorage('upnex_notifications', notifications) }, [notifications])

  const addStudent = useCallback((data: Omit<Student, 'id' | 'createdAt' | 'leadScore' | 'enrollmentProbability' | 'nextAction' | 'tags'>) => {
    const ai = scoreStudent(data)
    const newStudent: Student = {
      ...data,
      id: `s${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      tags: [data.major, data.preferredCountry].filter(Boolean),
      ...ai,
    }
    setStudents(prev => {
      const next = [newStudent, ...prev]
      saveToStorage('upnex_students', next)
      return next
    })
    // initialise empty doc records for new student
    setDocs(prev => {
      const next = { ...prev, [newStudent.id]: Object.fromEntries(DOC_TYPES.map(d => [d, { status: 'missing' as const }])) }
      saveToStorage('upnex_docs', next)
      return next
    })
    const newTask: Task = {
      id: `t${Date.now()}`,
      priority: 'high',
      student: data.name,
      action: `New lead — call within 24 hours and schedule consultation`,
      dueDate: 'Today',
      done: false,
    }
    setTasks(prev => {
      const next = [newTask, ...prev]
      saveToStorage('upnex_tasks', next)
      return next
    })
  }, [])

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id !== id) return s
        const updated = { ...s, ...updates }
        return { ...updated, ...scoreStudent(updated) }
      })
      saveToStorage('upnex_students', next)
      return next
    })
  }, [])

  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => {
      const next = prev.filter(s => s.id !== id)
      saveToStorage('upnex_students', next)
      return next
    })
    setDocs(prev => {
      const next = { ...prev }
      delete next[id]
      saveToStorage('upnex_docs', next)
      return next
    })
  }, [])

  const moveStudent = useCallback((id: string, stage: PipelineStage) => {
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id !== id) return s
        const updated = { ...s, status: stage }
        return { ...updated, ...scoreStudent(updated) }
      })
      saveToStorage('upnex_students', next)
      return next
    })
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
      saveToStorage('upnex_tasks', next)
      return next
    })
  }, [])

  const setDocStatus = useCallback((studentId: string, docType: string, status: DocEntry['status'], filename?: string) => {
    setDocs(prev => {
      const studentDocs = { ...(prev[studentId] || {}) }
      studentDocs[docType] = { status, filename, uploadedAt: status === 'uploaded' ? new Date().toISOString() : undefined }
      const next = { ...prev, [studentId]: studentDocs }
      saveToStorage('upnex_docs', next)

      // After updating, compute missing docs for this student and fire a notification
      setStudents(currentStudents => {
        const student = currentStudents.find(s => s.id === studentId)
        if (!student) return currentStudents
        const updatedStudentDocs = next[studentId] || {}
        const missingDocs = DOC_TYPES.filter(dt => {
          const entry = updatedStudentDocs[dt]
          return !entry || entry.status === 'missing'
        })
        if (missingDocs.length > 0) {
          const notif = buildMissingNotification(studentId, student.name, missingDocs)
          setNotifications(prevNotifs => {
            // Remove old unread notification for same student, add fresh one
            const filtered = prevNotifs.filter(n => !(n.studentId === studentId && !n.read))
            const updated = [notif, ...filtered]
            saveToStorage('upnex_notifications', updated)
            return updated
          })
        } else {
          // All docs uploaded — remove any pending notification for this student
          setNotifications(prevNotifs => {
            const updated = prevNotifs.filter(n => n.studentId !== studentId)
            saveToStorage('upnex_notifications', updated)
            return updated
          })
        }
        return currentStudents
      })

      return next
    })
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n)
      saveToStorage('upnex_notifications', next)
      return next
    })
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    saveToStorage('upnex_notifications', [])
  }, [])

  return (
    <Store.Provider value={{
      students, tasks, docs, notifications,
      addStudent, updateStudent, deleteStudent, moveStudent, toggleTask,
      setDocStatus, markNotificationRead, clearNotifications,
    }}>
      {children}
    </Store.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Store)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
