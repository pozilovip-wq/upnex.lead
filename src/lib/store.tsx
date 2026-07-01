'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Student, MOCK_STUDENTS, AI_TASKS, PipelineStage } from './data'

interface Task {
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
    'New Lead': 'Contact student and introduce our services',
    'Contacted': 'Schedule an initial consultation call',
    'Consultation Scheduled': 'Prepare consultation agenda and university list',
    'Documents Requested': 'Follow up on missing documents',
    'Documents Received': 'Review documents and prepare applications',
    'University Applied': 'Monitor application status and follow up with universities',
    'Admission Received': 'Review offer and confirm enrollment decision',
    'Scholarship Awarded': 'Prepare visa application documents',
    'Visa Preparation': 'Schedule visa interview practice session',
    'Visa Interview': 'Support student before and after interview',
    'Visa Approved': 'Arrange pre-departure orientation',
    'Travel Completed': 'Send welcome gift and check in after arrival',
  }
  const nextAction = actions[s.status ?? 'New Lead']
  return { leadScore, enrollmentProbability: pct, nextAction }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS)
  const [tasks, setTasks] = useState<Task[]>(AI_TASKS)

  const addStudent = useCallback((data: Omit<Student, 'id' | 'createdAt' | 'leadScore' | 'enrollmentProbability' | 'nextAction' | 'tags'>) => {
    const ai = scoreStudent(data)
    const newStudent: Student = {
      ...data,
      id: `s${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      tags: [data.major, data.preferredCountry].filter(Boolean),
      ...ai,
    }
    setStudents(prev => [newStudent, ...prev])
    // Auto-generate AI task
    setTasks(prev => [{
      id: `t${Date.now()}`,
      priority: 'high',
      student: data.name,
      action: `New lead added — contact and schedule initial consultation`,
      dueDate: 'Today',
      done: false,
    }, ...prev])
  }, [])

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s
      const updated = { ...s, ...updates }
      const ai = scoreStudent(updated)
      return { ...updated, ...ai }
    }))
  }, [])

  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id))
  }, [])

  const moveStudent = useCallback((id: string, stage: PipelineStage) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s
      const updated = { ...s, status: stage }
      const ai = scoreStudent(updated)
      return { ...updated, ...ai }
    }))
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
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
