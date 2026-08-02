'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Student, AI_TASKS, PipelineStage } from './data'
import { supabase } from './supabase'

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
  fileUrl?: string
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

interface StoreState {
  students: Student[]
  tasks: Task[]
  docs: DocStore
  notifications: AppNotification[]
  loading: boolean
  addStudent: (s: Omit<Student, 'id' | 'createdAt' | 'leadScore' | 'enrollmentProbability' | 'nextAction' | 'tags'>) => Promise<void>
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  moveStudent: (id: string, stage: PipelineStage) => Promise<void>
  toggleTask: (id: string) => void
  setDocStatus: (studentId: string, docType: string, status: DocEntry['status'], filename?: string, file?: File) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  clearNotifications: () => void
}

const Store = createContext<StoreState | null>(null)

function scoreStudent(s: Partial<Student>): { leadScore: 'Hot' | 'Warm' | 'Cold'; enrollmentProbability: number; nextAction: string } {
  // Trust the bot-assigned score when there's no real academic data to calculate from
  if (s.leadScore && !s.gpa && !s.ielts) {
    const pct = s.enrollmentProbability ?? (s.leadScore === 'Hot' ? 70 : s.leadScore === 'Warm' ? 50 : 20)
    const botActions: Record<string, string> = {
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
    return { leadScore: s.leadScore as 'Hot' | 'Warm' | 'Cold', enrollmentProbability: pct, nextAction: botActions[s.status ?? 'New Lead'] ?? '' }
  }
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

// Map DB row → Student JS object
function rowToStudent(row: Record<string, unknown>): Student {
  return {
    id: row.id as string,
    name: row.full_name as string,
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    telegram: (row.telegram as string) || '',
    telegramChatId: (row.telegram_chat_id as string) || '',
    instagram: (row.instagram as string) || '',
    country: (row.country as string) || 'Uzbekistan',
    city: (row.city as string) || '',
    age: (row.age as number) || 18,
    school: (row.school as string) || '',
    gpa: Number(row.gpa) || 0,
    ielts: Number(row.ielts) || 0,
    duolingo: row.duolingo as number | undefined,
    sat: row.sat as number | undefined,
    englishWaiver: Boolean(row.english_waiver),
    major: (row.major as string) || '',
    preferredUniversities: (row.preferred_universities as string[]) || [],
    preferredCountry: (row.preferred_country as string) || 'USA',
    intake: (row.intake as 'Fall' | 'Spring') || 'Fall',
    budget: Number(row.budget) || 0,
    parentName: (row.parent_name as string) || '',
    parentPhone: (row.parent_phone as string) || '',
    sponsorName: row.sponsor_name as string | undefined,
    passportStatus: (row.passport_status as Student['passportStatus']) || 'Not Started',
    notes: (row.notes as string) || '',
    counselor: (row.counselor_name as string) || '',
    status: (row.stage as PipelineStage) || 'New Lead',
    leadScore: (row.lead_score as 'Hot' | 'Warm' | 'Cold') || 'Cold',
    enrollmentProbability: (row.enrollment_probability as number) || 0,
    nextAction: (row.next_action as string) || '',
    lastContact: (row.last_contact as string) || '',
    createdAt: ((row.created_at as string) || '').slice(0, 10),
    tags: (row.tags as string[]) || [],
  }
}

// Map Student JS object → DB insert/update fields
function studentToRow(s: Partial<Student> & { name?: string }) {
  const out: Record<string, unknown> = {}
  if (s.name !== undefined) out.full_name = s.name
  if (s.email !== undefined) out.email = s.email
  if (s.phone !== undefined) out.phone = s.phone
  if (s.telegram !== undefined) out.telegram = s.telegram
  if (s.telegramChatId !== undefined) out.telegram_chat_id = s.telegramChatId
  if (s.instagram !== undefined) out.instagram = s.instagram
  if (s.country !== undefined) out.country = s.country
  if (s.city !== undefined) out.city = s.city
  if (s.age !== undefined) out.age = s.age
  if (s.school !== undefined) out.school = s.school
  if (s.gpa !== undefined) out.gpa = s.gpa
  if (s.ielts !== undefined) out.ielts = s.ielts
  if (s.duolingo !== undefined) out.duolingo = s.duolingo
  if (s.sat !== undefined) out.sat = s.sat
  if (s.englishWaiver !== undefined) out.english_waiver = s.englishWaiver
  if (s.major !== undefined) out.major = s.major
  if (s.preferredUniversities !== undefined) out.preferred_universities = s.preferredUniversities
  if (s.preferredCountry !== undefined) out.preferred_country = s.preferredCountry
  if (s.intake !== undefined) out.intake = s.intake
  if (s.budget !== undefined) out.budget = s.budget
  if (s.parentName !== undefined) out.parent_name = s.parentName
  if (s.parentPhone !== undefined) out.parent_phone = s.parentPhone
  if (s.sponsorName !== undefined) out.sponsor_name = s.sponsorName
  if (s.passportStatus !== undefined) out.passport_status = s.passportStatus
  if (s.notes !== undefined) out.notes = s.notes
  if (s.counselor !== undefined) out.counselor_name = s.counselor
  if (s.status !== undefined) out.stage = s.status
  if (s.leadScore !== undefined) out.lead_score = s.leadScore
  if (s.enrollmentProbability !== undefined) out.enrollment_probability = s.enrollmentProbability
  if (s.nextAction !== undefined) out.next_action = s.nextAction
  if (s.lastContact !== undefined) out.last_contact = s.lastContact || null
  if (s.tags !== undefined) out.tags = s.tags
  return out
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
  const [students, setStudents] = useState<Student[]>([])
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage<Task[]>('upnex_tasks', AI_TASKS as Task[]))
  const [docs, setDocs] = useState<DocStore>({})
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  // ─── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)

      // Load students
      const { data: studentRows } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (!cancelled && studentRows) {
        setStudents(studentRows.map(rowToStudent))
      }

      // Load all documents
      const { data: docRows } = await supabase
        .from('documents')
        .select('*')

      if (!cancelled && docRows) {
        const docStore: DocStore = {}
        for (const row of docRows) {
          if (!docStore[row.student_id]) docStore[row.student_id] = {}
          docStore[row.student_id][row.doc_type] = {
            status: row.status,
            filename: row.filename ?? undefined,
            uploadedAt: row.uploaded_at ?? undefined,
            fileUrl: row.file_url ?? undefined,
          }
        }
        setDocs(docStore)
      }

      // Load notifications
      const { data: notifRows } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (!cancelled && notifRows) {
        setNotifications(notifRows.map(r => ({
          id: r.id,
          studentId: r.student_id,
          studentName: r.student_name,
          type: 'missing_docs' as const,
          missingDocs: r.missing_docs ?? [],
          createdAt: r.created_at,
          read: r.is_read,
          telegramText: r.telegram_text ?? '',
        })))
      }

      if (!cancelled) setLoading(false)
    }

    loadData()
    return () => { cancelled = true }
  }, [])

  // ─── addStudent ──────────────────────────────────────────────────────────────
  const addStudent = useCallback(async (data: Omit<Student, 'id' | 'createdAt' | 'leadScore' | 'enrollmentProbability' | 'nextAction' | 'tags'>) => {
    const ai = scoreStudent(data)
    const tags = [data.major, data.preferredCountry].filter(Boolean)

    const row = {
      ...studentToRow({ ...data, ...ai, tags }),
    }

    const { data: inserted, error } = await supabase
      .from('students')
      .insert(row)
      .select()
      .single()

    if (error || !inserted) {
      console.error('Failed to add student:', error)
      return
    }

    const newStudent = rowToStudent(inserted)
    setStudents(prev => [newStudent, ...prev])

    // Initialize document rows for all doc types
    const docInserts = DOC_TYPES.map(dt => ({
      student_id: newStudent.id,
      doc_type: dt,
      status: 'missing',
    }))
    await supabase.from('documents').insert(docInserts)

    setDocs(prev => ({
      ...prev,
      [newStudent.id]: Object.fromEntries(DOC_TYPES.map(d => [d, { status: 'missing' as const }])),
    }))

    // Add a task in localStorage
    const newTask: Task = {
      id: `t${Date.now()}`,
      priority: 'high',
      student: data.name,
      action: 'New lead — call within 24 hours and schedule consultation',
      dueDate: 'Today',
      done: false,
    }
    setTasks(prev => {
      const next = [newTask, ...prev]
      saveToStorage('upnex_tasks', next)
      return next
    })
  }, [])

  // ─── updateStudent ───────────────────────────────────────────────────────────
  const updateStudent = useCallback(async (id: string, updates: Partial<Student>) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s
        const merged = { ...s, ...updates }
        return { ...merged, ...scoreStudent(merged) }
      })
      return updated
    })

    const found = students.find(s => s.id === id)
    if (!found) return
    const merged = { ...found, ...updates }
    const scored = { ...merged, ...scoreStudent(merged) }
    const row = studentToRow(scored)

    await supabase.from('students').update(row).eq('id', id)
  }, [students])

  // ─── deleteStudent ───────────────────────────────────────────────────────────
  const deleteStudent = useCallback(async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id))
    setDocs(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setNotifications(prev => prev.filter(n => n.studentId !== id))
    await supabase.from('students').delete().eq('id', id)
  }, [])

  // ─── moveStudent ─────────────────────────────────────────────────────────────
  const moveStudent = useCallback(async (id: string, stage: PipelineStage) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s
      const updated = { ...s, status: stage }
      return { ...updated, ...scoreStudent(updated) }
    }))

    const found = students.find(s => s.id === id)
    const ai = found ? scoreStudent({ ...found, status: stage }) : {}

    await supabase.from('students').update({
      stage,
      lead_score: (ai as { leadScore?: string }).leadScore,
      enrollment_probability: (ai as { enrollmentProbability?: number }).enrollmentProbability,
      next_action: (ai as { nextAction?: string }).nextAction,
    }).eq('id', id)

    // Log to activity_log
    await supabase.from('activity_log').insert({
      student_id: id,
      action: `Moved to ${stage}`,
    })
  }, [students])

  // ─── toggleTask (localStorage only) ─────────────────────────────────────────
  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
      saveToStorage('upnex_tasks', next)
      return next
    })
  }, [])

  // ─── setDocStatus ────────────────────────────────────────────────────────────
  const setDocStatus = useCallback(async (
    studentId: string,
    docType: string,
    status: DocEntry['status'],
    filename?: string,
    file?: File,
  ) => {
    let fileUrl: string | undefined
    let filePath: string | undefined

    // Upload file to Supabase Storage if provided
    if (file && status === 'uploaded') {
      const ext = file.name.split('.').pop()
      filePath = `students/${studentId}/${docType}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('student-documents')
          .getPublicUrl(filePath)
        fileUrl = urlData?.publicUrl
      }
    }

    const uploadedAt = status === 'uploaded' ? new Date().toISOString() : undefined

    // Upsert document row
    await supabase.from('documents').upsert({
      student_id: studentId,
      doc_type: docType,
      status,
      filename: filename ?? null,
      file_path: filePath ?? null,
      file_url: fileUrl ?? null,
      uploaded_at: uploadedAt ?? null,
    }, { onConflict: 'student_id,doc_type' })

    // Update local state
    setDocs(prev => {
      const studentDocs = { ...(prev[studentId] || {}) }
      studentDocs[docType] = { status, filename, uploadedAt, fileUrl }
      const next = { ...prev, [studentId]: studentDocs }

      // Compute missing docs and update notification
      const updatedStudentDocs = next[studentId] || {}
      const missingDocs = DOC_TYPES.filter(dt => {
        const entry = updatedStudentDocs[dt]
        return !entry || entry.status === 'missing'
      })

      const studentName = students.find(s => s.id === studentId)?.name ?? ''

      if (missingDocs.length > 0 && studentName) {
        const notif = buildMissingNotification(studentId, studentName, missingDocs)

        // Upsert notification in DB
        supabase.from('notifications').upsert({
          id: notif.id,
          student_id: studentId,
          student_name: studentName,
          type: 'missing_docs',
          missing_docs: missingDocs,
          telegram_text: notif.telegramText,
          is_read: false,
          created_at: notif.createdAt,
        }).then(() => {})

        setNotifications(prevNotifs => {
          const filtered = prevNotifs.filter(n => !(n.studentId === studentId && !n.read))
          return [notif, ...filtered]
        })
      } else {
        // All docs uploaded — remove notifications for this student
        supabase.from('notifications').delete().eq('student_id', studentId).then(() => {})
        setNotifications(prevNotifs => prevNotifs.filter(n => n.studentId !== studentId))
      }

      return next
    })
  }, [students])

  // ─── markNotificationRead ────────────────────────────────────────────────────
  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }, [])

  // ─── clearNotifications ──────────────────────────────────────────────────────
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <Store.Provider value={{
      students, tasks, docs, notifications, loading,
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
