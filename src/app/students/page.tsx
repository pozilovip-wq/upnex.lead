'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import AddStudentModal from '@/components/students/AddStudentModal'
import AddLeadModal from '@/components/students/AddLeadModal'
import AIAssistant from '@/components/ai/AIAssistant'
import { useStore } from '@/lib/store'
import { Student } from '@/lib/data'
import { cn, getLeadScoreColor, getStatusColor, formatCurrency, getInitials } from '@/lib/utils'
import { Search, Plus, ChevronRight, Mail, Phone, MapPin, Brain, Star, Users, Trash2, Zap, Send, ArrowUpDown, Clock } from 'lucide-react'

const JUNK_NAME = /^(unknown|aniqlanmagan|maktab|kollej|bakalavr|magistr|litsey|sinf|universitet|bachelor|master|phd|foundation|america|amerika|usa|aqsh|yevropa|europe|toshkent|samarqand|namangan|andijon|farg|buxoro|jizzax|navoiy|surxon|xorazm|ishlaydi|hech|graduated|ha|yo'q|\d+)$/i

function displayName(student: Student): string {
  if (!student.name || JUNK_NAME.test(student.name.trim())) {
    return student.telegram ? student.telegram : 'Unknown'
  }
  return student.name
}

const OUTREACH_MESSAGE = `Assalomu alaykum! 😊 Upnex jamoasidan.
@upnex_uzbot Botimiz orqali qoldirgan murojaatingizni ko'rib chiqdik. Sizning holatingiz bo'yicha bir nechta yaxshi imkoniyatlar bor o'z o'qishingizni Amerikada boshlash uchun.
Qulay bo'lsa, 5 daqiqalik qo'ng'iroq qilsangiz, to'liq ma'lumot beraman.`

function telegramLink(telegram: string, withMessage = false): string {
  const msg = withMessage ? `?text=${encodeURIComponent(OUTREACH_MESSAGE)}` : ''
  if (telegram.startsWith('@')) return `https://t.me/${telegram.slice(1)}${msg}`
  if (telegram.startsWith('id:')) return `tg://user?id=${telegram.slice(3)}`
  return `https://t.me/${telegram}${msg}`
}

function timeAgo(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) {
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `Today, ${time}`
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

type DateFilter = 'all' | 'today' | '7days' | '30days' | 'thismonth'

const DATE_FILTERS: { id: DateFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: '7 days' },
  { id: '30days', label: '30 days' },
  { id: 'thismonth', label: 'This month' },
]

function matchesDateFilter(createdAt: string, filter: DateFilter): boolean {
  if (filter === 'all') return true
  if (!createdAt) return false
  const d = new Date(createdAt)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (filter === 'today') return d >= today
  if (filter === '7days') return d >= new Date(today.getTime() - 6 * 86400000)
  if (filter === '30days') return d >= new Date(today.getTime() - 29 * 86400000)
  if (filter === 'thismonth') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  return true
}

function StudentsContent() {
  const { students, deleteStudent } = useStore()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [filterScore, setFilterScore] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [newestFirst, setNewestFirst] = useState(true)
  const [selected, setSelected] = useState<Student | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Apply URL params from dashboard navigation
  useEffect(() => {
    const score = searchParams.get('score')
    const name = searchParams.get('name')
    const filter = searchParams.get('filter')
    if (score) setFilterScore(score)
    if (name) setSearch(name)
    if (filter === 'today') setDateFilter('today')
  }, [searchParams])

  // Auto-select student when arriving via ?name=
  useEffect(() => {
    const name = searchParams.get('name')
    if (name && students.length > 0 && !selected) {
      const match = students.find(s => s.name === name)
      if (match) setSelected(match)
    }
  }, [searchParams, students])

  const filtered = students
    .filter(s => {
      const matchSearch = !search ||
        displayName(s).toLowerCase().includes(search.toLowerCase()) ||
        s.telegram.toLowerCase().includes(search.toLowerCase()) ||
        s.major.toLowerCase().includes(search.toLowerCase()) ||
        s.country.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase())
      const matchScore = filterScore === 'all' || s.leadScore === filterScore
      const matchDate = matchesDateFilter(s.createdAt, dateFilter)
      return matchSearch && matchScore && matchDate
    })
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return newestFirst ? tb - ta : ta - tb
    })

  const handleDelete = (id: string) => {
    deleteStudent(id)
    if (selected?.id === id) setSelected(null)
    setConfirmDelete(null)
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: '100dvh' }}>
      <Header title="Students" />

      <div className="flex flex-1 overflow-hidden">
        {/* List Panel */}
        <div className={cn('flex flex-col border-r border-slate-200 bg-white transition-all duration-300', selected ? 'w-80 flex-shrink-0' : 'flex-1')}>
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 space-y-2.5">
            {/* Search + action buttons */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setNewestFirst(v => !v)}
                title={newestFirst ? 'Showing newest first' : 'Showing oldest first'}
                className={cn(
                  'p-2 rounded-xl transition-all duration-150',
                  newestFirst ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                )}
              >
                <ArrowUpDown size={15} />
              </button>
              <button
                onClick={() => setShowLeadModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-[0.97] transition-all duration-150"
                title="Quick lead entry"
              >
                <Zap size={14} className="text-white" />
                <span className="text-white text-xs font-semibold hidden sm:inline">Add Lead</span>
              </button>
              <button
                onClick={() => setShowStudentModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.97] transition-all duration-150"
                title="Full student profile"
              >
                <Plus size={15} className="text-white" />
                <span className="text-white text-xs font-semibold hidden sm:inline">Add Student</span>
              </button>
            </div>

            {/* Lead score filter */}
            <div className="flex gap-1.5 items-center">
              {['all', 'Hot', 'Warm', 'Cold'].map(score => (
                <button
                  key={score}
                  onClick={() => setFilterScore(score)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    filterScore === score ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  )}
                >
                  {score === 'all' ? 'All' : score}
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400 tabular-nums">{filtered.length} students</span>
            </div>

            {/* Date range filter */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {DATE_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex-shrink-0',
                    dateFilter === f.id
                      ? f.id === 'today' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  )}
                >
                  {f.id === 'today' && dateFilter === 'today' ? `✦ ${f.label}` : f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Users size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No students found</p>
                {dateFilter !== 'all' && (
                  <button onClick={() => setDateFilter('all')} className="mt-2 text-xs text-blue-600 font-medium hover:underline">
                    Clear date filter
                  </button>
                )}
              </div>
            )}
            {filtered.map(student => {
              const age = timeAgo(student.createdAt)
              const isNew = student.createdAt
                ? new Date().getTime() - new Date(student.createdAt).getTime() < 86400000
                : false

              return (
                <button
                  key={student.id}
                  onClick={() => setSelected(student)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors group',
                    selected?.id === student.id && 'bg-blue-50 border-l-2 border-l-blue-500'
                  )}
                >
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(student.name)}
                    </div>
                    {isNew && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{displayName(student)}</p>
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md border flex-shrink-0', getLeadScoreColor(student.leadScore))}>
                        {student.leadScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{student.major} · {student.preferredCountry}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-medium', getStatusColor(student.status))}>
                        {student.status}
                      </span>
                      {age && (
                        <span className={cn(
                          'text-[10px] flex items-center gap-0.5',
                          isNew ? 'text-emerald-600 font-medium' : 'text-slate-400'
                        )}>
                          <Clock size={9} />
                          {age}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-6 space-y-5 animate-fade-in">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1e40af] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {getInitials(selected.name)}
                </div>
                <div className="flex-1">
                  <h2 className="text-white text-xl font-bold">{displayName(selected)}</h2>
                  {displayName(selected) !== selected.name && selected.name && (
                    <p className="text-blue-300 text-xs mt-0.5">Bot name: {selected.name}</p>
                  )}
                  <p className="text-blue-200 text-sm">{selected.major} · {selected.preferredCountry}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-lg border', getLeadScoreColor(selected.leadScore))}>
                      {selected.leadScore} Lead
                    </span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-lg font-medium', getStatusColor(selected.status))}>
                      {selected.status}
                    </span>
                    {selected.createdAt && (
                      <span className="text-xs text-blue-200/80 flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(selected.createdAt)}
                      </span>
                    )}
                    {selected.tags.map(t => (
                      <span key={t} className="text-xs bg-white/15 text-white px-2 py-0.5 rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-white text-2xl font-bold">{selected.enrollmentProbability}%</div>
                    <div className="text-blue-200 text-xs">Enrollment Probability</div>
                  </div>
                  <div className="flex gap-2">
                    {selected.telegram && (
                      <a
                        href={telegramLink(selected.telegram, true)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-xl transition-colors"
                        title="Open in Telegram with message"
                      >
                        <Send size={13} className="text-white" />
                        <span className="text-white text-xs font-semibold">Telegram</span>
                      </a>
                    )}
                    <button
                      onClick={() => setConfirmDelete(selected.id)}
                      className="p-2 bg-white/10 hover:bg-red-500/30 rounded-xl transition-colors"
                      title="Delete student"
                    >
                      <Trash2 size={14} className="text-white/70" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Confirm */}
            {confirmDelete === selected.id && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                <p className="text-sm text-red-700 font-medium">Delete {selected.name}? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(null)} className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600">Cancel</button>
                  <button onClick={() => handleDelete(selected.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Delete</button>
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-blue-600" />
                <h3 className="font-semibold text-slate-800">AI Analysis</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">{selected.gpa}</div>
                  <div className="text-xs text-slate-500">GPA</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">{selected.ielts}</div>
                  <div className="text-xs text-slate-500">IELTS</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">{selected.budget ? formatCurrency(selected.budget) : '—'}</div>
                  <div className="text-xs text-slate-500">Budget/yr</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Enrollment Probability</span>
                  <span className="font-semibold text-blue-600">{selected.enrollmentProbability}%</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2">
                  <div
                    className={cn('h-2 rounded-full', selected.enrollmentProbability >= 70 ? 'bg-emerald-500' : selected.enrollmentProbability >= 45 ? 'bg-amber-500' : 'bg-blue-500')}
                    style={{ width: `${selected.enrollmentProbability}%` }}
                  />
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">Next Recommended Action</p>
                <p className="text-xs text-blue-600">{selected.nextAction}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selected.email || '—' },
                  { icon: Phone, label: 'Phone', value: selected.phone || '—' },
                  { label: 'Telegram', value: selected.telegram || '—', link: selected.telegram ? telegramLink(selected.telegram) : undefined },
                  { label: 'Instagram', value: selected.instagram || '—' },
                  { icon: MapPin, label: 'Location', value: [selected.city, selected.country].filter(Boolean).join(', ') || '—' },
                  { label: 'Age', value: selected.age ? `${selected.age} years old` : '—' },
                ].map(({ icon: Icon, label, value, link }: any) => (
                  <div key={label} className="flex items-start gap-2">
                    {Icon && <Icon size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-[10px] text-slate-400">{label}</p>
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-medium break-all hover:underline flex items-center gap-1">
                          <Send size={10} />{value}
                        </a>
                      ) : (
                        <p className="text-xs text-slate-700 font-medium break-all">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Academic Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'School', value: selected.school || '—' },
                  { label: 'GPA', value: selected.gpa ? `${selected.gpa} / 4.0` : '—' },
                  { label: 'IELTS', value: selected.ielts ? `${selected.ielts}` : '—' },
                  { label: 'Duolingo', value: selected.duolingo ? `${selected.duolingo}` : '—' },
                  { label: 'SAT', value: selected.sat ? `${selected.sat}` : '—' },
                  { label: 'Intake', value: selected.intake },
                  { label: 'Passport', value: selected.passportStatus },
                  { label: 'Counselor', value: selected.counselor },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <p className="text-xs text-slate-700 font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Universities */}
            {selected.preferredUniversities.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-3">Target Universities</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.preferredUniversities.map(u => (
                    <span key={u} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 font-medium flex items-center gap-1">
                      <Star size={10} />
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Parent */}
            {(selected.parentName || selected.parentPhone) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-3">Parent / Sponsor</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400">Parent Name</p>
                    <p className="text-xs text-slate-700 font-medium">{selected.parentName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Parent Phone</p>
                    <p className="text-xs text-slate-700 font-medium">{selected.parentPhone || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selected.notes && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-2">Notes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{selected.notes}</p>
              </div>
            )}

            {/* AI Assistant */}
            <AIAssistant student={selected} />
          </div>
        )}

        {!selected && (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium text-slate-500">Select a student to view details</p>
              <p className="text-xs text-slate-400 mt-1">or</p>
              <div className="mt-3 flex gap-2 mx-auto justify-center">
                <button
                  onClick={() => setShowLeadModal(true)}
                  className="flex items-center gap-2 bg-pink-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-pink-600 active:scale-[0.97] transition-all duration-150"
                >
                  <Zap size={14} />
                  Add Lead
                </button>
                <button
                  onClick={() => setShowStudentModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.97] transition-all duration-150"
                >
                  <Plus size={14} />
                  Add Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLeadModal && <AddLeadModal onClose={() => setShowLeadModal(false)} />}
      {showStudentModal && <AddStudentModal onClose={() => setShowStudentModal(false)} />}
    </div>
  )
}

export default function StudentsPage() {
  return (
    <Suspense fallback={null}>
      <StudentsContent />
    </Suspense>
  )
}
