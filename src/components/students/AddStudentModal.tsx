'use client'

import { useState } from 'react'
import { X, User, Phone, Mail, MapPin, GraduationCap, DollarSign, BookOpen, Brain } from 'lucide-react'
import { useStore } from '@/lib/store'
import { PipelineStage } from '@/lib/data'
import { cn } from '@/lib/utils'

interface Props {
  onClose: () => void
}

const STAGES: PipelineStage[] = [
  'New Lead', 'Contacted', 'Consultation Scheduled', 'Documents Requested',
  'Documents Received', 'University Applied', 'Admission Received',
  'Scholarship Awarded', 'Visa Preparation', 'Visa Interview', 'Visa Approved', 'Travel Completed'
]

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'preferences', label: 'Preferences', icon: BookOpen },
  { id: 'financial', label: 'Financial', icon: DollarSign },
]

const COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Netherlands', 'France', 'South Korea', 'Japan', 'UAE']
const MAJORS = ['Computer Science', 'Business Administration', 'Medicine', 'Engineering', 'International Relations', 'Data Science', 'Law', 'Economics', 'Psychology', 'Architecture', 'Nursing', 'Pharmacy']
const PASSPORT_STATUSES = ['Valid', 'Expired', 'In Process', 'Not Started'] as const

export default function AddStudentModal({ onClose }: Props) {
  const { addStudent } = useStore()
  const [section, setSection] = useState('personal')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', telegram: '', instagram: '',
    country: 'Uzbekistan', city: '', age: '',
    school: '', gpa: '', ielts: '', duolingo: '', sat: '',
    englishWaiver: false,
    major: '', preferredCountry: 'USA', preferredUniversities: '',
    intake: 'Fall' as 'Fall' | 'Spring', budget: '',
    parentName: '', parentPhone: '', sponsorName: '',
    passportStatus: 'Not Started' as typeof PASSPORT_STATUSES[number],
    notes: '', counselor: 'Dilnoza Yusupova',
    status: 'New Lead' as PipelineStage,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const set = (k: string, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.major.trim()) e.major = 'Major is required'
    if (form.gpa && (Number(form.gpa) < 0 || Number(form.gpa) > 4)) e.gpa = 'GPA must be 0–4'
    if (form.ielts && (Number(form.ielts) < 0 || Number(form.ielts) > 9)) e.ielts = 'IELTS must be 0–9'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); setSection('personal'); return }

    addStudent({
      name: form.name,
      email: form.email,
      phone: form.phone,
      telegram: form.telegram,
      instagram: form.instagram,
      country: form.country,
      city: form.city,
      age: Number(form.age) || 18,
      school: form.school,
      gpa: Number(form.gpa) || 0,
      ielts: Number(form.ielts) || 0,
      duolingo: form.duolingo ? Number(form.duolingo) : undefined,
      sat: form.sat ? Number(form.sat) : undefined,
      englishWaiver: form.englishWaiver,
      major: form.major,
      preferredUniversities: form.preferredUniversities.split(',').map(u => u.trim()).filter(Boolean),
      preferredCountry: form.preferredCountry,
      intake: form.intake,
      budget: Number(form.budget) || 0,
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      sponsorName: form.sponsorName || undefined,
      passportStatus: form.passportStatus,
      notes: form.notes,
      counselor: form.counselor,
      status: form.status,
      lastContact: new Date().toISOString().slice(0, 10),
    })
    setSubmitted(true)
    setTimeout(onClose, 1200)
  }

  const inputClass = (field?: string) => cn(
    'w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    field && errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200'
  )

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Student Added!</h3>
          <p className="text-slate-400 text-sm">AI has scored the lead and created a follow-up task.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Add New Student / Lead</h2>
            <p className="text-xs text-slate-400 mt-0.5">AI will automatically score and prioritize this lead</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-2 border-b border-slate-100 overflow-x-auto">
          {SECTIONS.map(s => {
            const Icon = s.icon
            const hasError = s.id === 'personal' && (errors.name || errors.phone)
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  section === s.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100',
                  hasError && section !== s.id && 'ring-2 ring-red-300'
                )}
              >
                <Icon size={13} />
                {s.label}
                {hasError && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
              </button>
            )
          })}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">

          {section === 'personal' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Full Name *</label>
                  <input className={inputClass('name')} placeholder="e.g. Azizbek Nazarov" value={form.name} onChange={e => set('name', e.target.value)} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Age</label>
                  <input className={inputClass()} type="number" placeholder="18" value={form.age} onChange={e => set('age', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Phone *</label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className={cn(inputClass('phone'), 'pl-8')} placeholder="+998 90 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className={cn(inputClass(), 'pl-8')} type="email" placeholder="student@gmail.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Telegram</label>
                  <input className={inputClass()} placeholder="@username" value={form.telegram} onChange={e => set('telegram', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Instagram</label>
                  <input className={inputClass()} placeholder="@username" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Country</label>
                  <input className={inputClass()} placeholder="Uzbekistan" value={form.country} onChange={e => set('country', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">City</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className={cn(inputClass(), 'pl-8')} placeholder="Tashkent" value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Parent Name</label>
                  <input className={inputClass()} placeholder="Parent full name" value={form.parentName} onChange={e => set('parentName', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Parent Phone</label>
                  <input className={inputClass()} placeholder="+998 90 000 0000" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Passport Status</label>
                <div className="flex gap-2 flex-wrap">
                  {PASSPORT_STATUSES.map(ps => (
                    <button key={ps} onClick={() => set('passportStatus', ps)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        form.passportStatus === ps ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      )}>
                      {ps}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Pipeline Status</label>
                <select className={inputClass()} value={form.status} onChange={e => set('status', e.target.value)}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}

          {section === 'academic' && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">School / University</label>
                <input className={inputClass()} placeholder="e.g. Tashkent School #45" value={form.school} onChange={e => set('school', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">GPA (0–4.0)</label>
                  <input className={inputClass('gpa')} type="number" step="0.1" min="0" max="4" placeholder="3.8" value={form.gpa} onChange={e => set('gpa', e.target.value)} />
                  {errors.gpa && <p className="text-xs text-red-500 mt-1">{errors.gpa}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">IELTS Score (0–9)</label>
                  <input className={inputClass('ielts')} type="number" step="0.5" min="0" max="9" placeholder="7.0" value={form.ielts} onChange={e => set('ielts', e.target.value)} />
                  {errors.ielts && <p className="text-xs text-red-500 mt-1">{errors.ielts}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Duolingo Score</label>
                  <input className={inputClass()} type="number" placeholder="115" value={form.duolingo} onChange={e => set('duolingo', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">SAT Score</label>
                  <input className={inputClass()} type="number" placeholder="1350" value={form.sat} onChange={e => set('sat', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => set('englishWaiver', !form.englishWaiver)}
                    className={cn('w-10 h-6 rounded-full transition-colors cursor-pointer', form.englishWaiver ? 'bg-blue-600' : 'bg-slate-200')}
                  >
                    <div className={cn('w-4 h-4 bg-white rounded-full shadow mt-1 transition-transform mx-1', form.englishWaiver ? 'translate-x-4' : 'translate-x-0')} />
                  </div>
                  <span className="text-sm text-slate-700">English Proficiency Waiver</span>
                </label>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Notes</label>
                <textarea
                  className={cn(inputClass(), 'resize-none h-20')}
                  placeholder="Any additional notes about this student..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </>
          )}

          {section === 'preferences' && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Intended Major *</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {MAJORS.map(m => (
                    <button key={m} onClick={() => set('major', m)}
                      className={cn('px-2 py-2 rounded-lg text-xs font-medium border transition-colors text-left',
                        form.major === m ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                      )}>
                      {m}
                    </button>
                  ))}
                </div>
                <input className={inputClass('major')} placeholder="Or type custom major..." value={form.major} onChange={e => set('major', e.target.value)} />
                {errors.major && <p className="text-xs text-red-500 mt-1">{errors.major}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Preferred Country</label>
                <div className="flex gap-2 flex-wrap">
                  {COUNTRIES.map(c => (
                    <button key={c} onClick={() => set('preferredCountry', c)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        form.preferredCountry === c ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      )}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Preferred Universities</label>
                <input className={inputClass()} placeholder="MIT, Harvard, Stanford (comma separated)" value={form.preferredUniversities} onChange={e => set('preferredUniversities', e.target.value)} />
                <p className="text-[10px] text-slate-400 mt-1">Separate multiple universities with commas</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Intake</label>
                <div className="flex gap-3">
                  {(['Fall', 'Spring'] as const).map(i => (
                    <button key={i} onClick={() => set('intake', i)}
                      className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                        form.intake === i ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                      )}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Assigned Counselor</label>
                <select className={inputClass()} value={form.counselor} onChange={e => set('counselor', e.target.value)}>
                  {['Dilnoza Yusupova', 'Jasur Toshmatov', 'Nilufar Karimova', 'Bobur Mirzayev'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {section === 'financial' && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Annual Budget (USD)</label>
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={cn(inputClass(), 'pl-8')} type="number" placeholder="30000" value={form.budget} onChange={e => set('budget', e.target.value)} />
                </div>
                {form.budget && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {[['< $20K', 'Tight budget — focus on scholarships and affordable universities'], ['$20–40K', 'Mid-range — good options in USA, Canada, Europe'], ['$40–60K', 'Comfortable — access to most universities'], ['$60K+', 'Premium — top universities with full options']].map(([label, desc]) => {
                      const b = Number(form.budget)
                      const active = (label === '< $20K' && b < 20000) || (label === '$20–40K' && b >= 20000 && b < 40000) || (label === '$40–60K' && b >= 40000 && b < 60000) || (label === '$60K+' && b >= 60000)
                      return active ? (
                        <div key={label} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
                          <p className="font-semibold text-blue-700">{label}</p>
                          <p className="text-blue-500 mt-0.5">{desc}</p>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Sponsor Name (if different from parent)</label>
                <input className={inputClass()} placeholder="Sponsor full name" value={form.sponsorName} onChange={e => set('sponsorName', e.target.value)} />
              </div>

              {/* AI Preview */}
              {(form.gpa || form.ielts || form.budget) && (
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={14} className="text-blue-400" />
                    <span className="text-white font-semibold text-sm">AI Lead Score Preview</span>
                  </div>
                  {(() => {
                    const score = (Number(form.gpa) / 4) * 35 + (Math.min(Number(form.ielts), 9) / 9) * 30 + (Math.min(Number(form.budget), 60000) / 60000) * 35
                    const pct = Math.round(score)
                    const label = pct >= 70 ? 'Hot 🔥' : pct >= 45 ? 'Warm ⚡' : 'Cold 🔵'
                    const color = pct >= 70 ? 'bg-red-500' : pct >= 45 ? 'bg-amber-500' : 'bg-blue-500'
                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-xs">Enrollment Probability</span>
                          <span className="text-white font-bold">{pct}% — {label}</span>
                        </div>
                        <div className="bg-white/10 rounded-full h-2">
                          <div className={cn('h-2 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
          <div className="flex gap-1">
            {SECTIONS.map((s, i) => (
              <div key={s.id} className={cn('w-2 h-2 rounded-full transition-colors', section === s.id ? 'bg-blue-600' : 'bg-slate-200')} />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
            {section !== 'financial' ? (
              <button
                onClick={() => {
                  const order = ['personal', 'academic', 'preferences', 'financial']
                  const next = order[order.indexOf(section) + 1]
                  if (next) setSection(next)
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
              >
                ✨ Add Student with AI
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
