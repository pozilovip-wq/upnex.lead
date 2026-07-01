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

interface StoreState {
  students: Student[]
  tasks: Task[]
  addStudent: (s: Omit<Student, 'id' | 'createdAt' | 'leadScore' | 'enrollmentProbability' | 'nextAction' | 'tags'>) => void
  updateStudent: (id: string, updates: Partial<Student>) => void
  deleteStudent: (id: string) => void
  moveStudent: (id: string, stage: PipelineStage) => void
  toggleTask: (id: string) => void
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage<Student[]>('upnex_students', MOCK_STUDENTS))
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage<Task[]>('upnex_tasks', AI_TASKS as Task[]))

  // Persist every change
  useEffect(() => { saveToStorage('upnex_students', students) }, [students])
  useEffect(() => { saveToStorage('upnex_tasks', tasks) }, [tasks])

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

  return (
    <Store.Provider value={{ students, tasks, addStudent, updateStudent, deleteStudent, moveStudent, toggleTask }}>
      {children}
    </Store.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Store)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
