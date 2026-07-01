'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { MOCK_STUDENTS, Student } from '@/lib/data'
import { cn, getLeadScoreColor, getStatusColor, formatCurrency, getInitials } from '@/lib/utils'
import { Search, Filter, Plus, ChevronRight, Mail, Phone, MapPin, Brain, Star, Flame, Users } from 'lucide-react'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [filterScore, setFilterScore] = useState<string>('all')
  const [selected, setSelected] = useState<Student | null>(null)

  const filtered = MOCK_STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.major.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
    const matchScore = filterScore === 'all' || s.leadScore === filterScore
    return matchSearch && matchScore
  })

  return (
    <div className="animate-fade-in h-screen flex flex-col">
      <Header title="Students" />

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className={cn('flex flex-col border-r border-slate-200 bg-white transition-all duration-300', selected ? 'w-80 flex-shrink-0' : 'flex-1')}>
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 space-y-3">
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
              <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <Filter size={15} className="text-slate-500" />
              </button>
              <button className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors">
                <Plus size={15} className="text-white" />
              </button>
            </div>

            <div className="flex gap-1.5">
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
              <span className="ml-auto text-xs text-slate-400 self-center">{filtered.length} students</span>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filtered.map(student => (
              <button
                key={student.id}
                onClick={() => setSelected(student)}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                  selected?.id === student.id && 'bg-blue-50 border-l-2 border-l-blue-500'
                )}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitials(student.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 truncate">{student.name}</p>
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ml-2 flex-shrink-0', getLeadScoreColor(student.leadScore))}>
                      {student.leadScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{student.major} · {student.preferredCountry}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-medium', getStatusColor(student.status))}>
                      {student.status}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">{student.enrollmentProbability}% prob</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5 animate-fade-in">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#0f1f3d] to-[#1e40af] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(selected.name)}
                </div>
                <div className="flex-1">
                  <h2 className="text-white text-xl font-bold">{selected.name}</h2>
                  <p className="text-blue-200 text-sm">{selected.major} · {selected.preferredCountry}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-lg border', getLeadScoreColor(selected.leadScore))}>
                      {selected.leadScore} Lead
                    </span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-lg font-medium', getStatusColor(selected.status))}>
                      {selected.status}
                    </span>
                    {selected.tags.map(t => (
                      <span key={t} className="text-xs bg-white/15 text-white px-2 py-0.5 rounded-lg">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-2xl font-bold">{selected.enrollmentProbability}%</div>
                  <div className="text-blue-200 text-xs">Enrollment Probability</div>
                </div>
              </div>
            </div>

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
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(selected.budget)}</div>
                  <div className="text-xs text-slate-500">Budget/yr</div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">Next Recommended Action</p>
                <p className="text-xs text-blue-600">{selected.nextAction}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selected.email },
                  { icon: Phone, label: 'Phone', value: selected.phone },
                  { label: 'Telegram', value: selected.telegram },
                  { label: 'Instagram', value: selected.instagram || '—' },
                  { icon: MapPin, label: 'Location', value: `${selected.city}, ${selected.country}` },
                  { label: 'Age', value: `${selected.age} years old` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    {Icon && <Icon size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-[10px] text-slate-400">{label}</p>
                      <p className="text-xs text-slate-700 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Academic Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'School', value: selected.school },
                  { label: 'GPA', value: `${selected.gpa} / 4.0` },
                  { label: 'IELTS', value: `${selected.ielts}` },
                  { label: 'Duolingo', value: selected.duolingo ? `${selected.duolingo}` : '—' },
                  { label: 'SAT', value: selected.sat ? `${selected.sat}` : '—' },
                  { label: 'English Waiver', value: selected.englishWaiver ? 'Yes' : 'No' },
                  { label: 'Intake', value: selected.intake },
                  { label: 'Passport', value: selected.passportStatus },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <p className="text-xs text-slate-700 font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Universities */}
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

            {/* Parent Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Parent / Sponsor</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400">Parent Name</p>
                  <p className="text-xs text-slate-700 font-medium">{selected.parentName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Parent Phone</p>
                  <p className="text-xs text-slate-700 font-medium">{selected.parentPhone}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-2">Notes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{selected.notes}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] text-slate-400">Counselor:</span>
                <span className="text-xs font-semibold text-slate-700">{selected.counselor}</span>
              </div>
            </div>

            {/* Generate Follow-up */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={15} className="text-orange-400" />
                <h3 className="text-white font-semibold text-sm">Generate AI Follow-up Message</h3>
              </div>
              <p className="text-slate-400 text-xs mb-3">AI will craft a personalized follow-up based on this student&apos;s profile and last interaction.</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
                ✨ Generate Follow-up with AI
              </button>
            </div>
          </div>
        )}

        {!selected && (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Users size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a student to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
