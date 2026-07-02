'use client'

import { useState } from 'react'
import { X, Brain, Camera, Send, MessageCircle, Phone, Globe, User } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Props {
  onClose: () => void
}

const SOURCES = [
  { id: 'instagram', label: 'Instagram', icon: Camera, color: 'from-pink-500 to-purple-600', bg: 'bg-pink-50 border-pink-200 text-pink-700' },
  { id: 'telegram', label: 'Telegram', icon: Send, color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'from-green-400 to-green-600', bg: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'phone', label: 'Phone Call', icon: Phone, color: 'from-slate-400 to-slate-600', bg: 'bg-slate-50 border-slate-200 text-slate-700' },
  { id: 'website', label: 'Website', icon: Globe, color: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'referral', label: 'Referral', icon: User, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
]

const ENGLISH_TESTS = ['IELTS', 'TOEFL', 'Duolingo', 'SAT', 'None yet']

export default function AddLeadModal({ onClose }: Props) {
  const { addStudent } = useStore()
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    source: 'instagram',
    sourceHandle: '',
    englishTest: 'IELTS',
    englishScore: '',
    preferredCountry: 'USA',
    notes: '',
  })

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const selectedSource = SOURCES.find(s => s.id === form.source)!

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone or contact is required'
    if (Object.keys(e).length) { setErrors(e); return }

    const ielts = form.englishTest === 'IELTS' ? Number(form.englishScore) || 0 : 0
    const duolingo = form.englishTest === 'Duolingo' ? Number(form.englishScore) || undefined : undefined
    const sat = form.englishTest === 'SAT' ? Number(form.englishScore) || undefined : undefined

    const sourceNote = form.sourceHandle
      ? `Lead from ${selectedSource.label} (${form.sourceHandle}). `
      : `Lead from ${selectedSource.label}. `
    const englishNote = form.englishScore
      ? `${form.englishTest}: ${form.englishScore}. `
      : ''

    addStudent({
      name: form.name,
      email: '',
      phone: form.phone,
      telegram: form.source === 'telegram' ? form.sourceHandle : '',
      instagram: form.source === 'instagram' ? form.sourceHandle : '',
      country: 'Uzbekistan',
      city: '',
      age: Number(form.age) || 18,
      school: '',
      gpa: 0,
      ielts,
      duolingo,
      sat,
      englishWaiver: false,
      major: '',
      preferredUniversities: [],
      preferredCountry: form.preferredCountry,
      intake: 'Fall',
      budget: 0,
      parentName: '',
      parentPhone: '',
      passportStatus: 'Not Started',
      notes: sourceNote + englishNote + (form.notes || ''),
      counselor: 'Dilnoza Yusupova',
      status: 'New Lead',
      lastContact: new Date().toISOString().slice(0, 10),
    })

    setSubmitted(true)
    setTimeout(onClose, 1400)
  }

  const inputClass = (field?: string) => cn(
    'w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    field && errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200'
  )

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 text-center shadow-2xl animate-fade-in">
          <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br', selectedSource.color)}>
            <selectedSource.icon size={28} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Lead Added!</h3>
          <p className="text-slate-400 text-sm">AI scored and created a follow-up task.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Add New Lead</h2>
            <p className="text-xs text-slate-400 mt-0.5">Quick entry — fill full details later</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Source Channel */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-2 block">Where did this lead come from?</label>
            <div className="grid grid-cols-3 gap-2">
              {SOURCES.map(s => {
                const Icon = s.icon
                const active = form.source === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => set('source', s.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all',
                      active
                        ? `border-transparent bg-gradient-to-br ${s.color} text-white shadow-lg scale-105`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <Icon size={16} />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Source handle */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              {form.source === 'instagram' ? 'Instagram handle' :
               form.source === 'telegram' ? 'Telegram username' :
               form.source === 'whatsapp' ? 'WhatsApp number' :
               form.source === 'referral' ? 'Referred by' : 'Source detail (optional)'}
            </label>
            <input
              className={inputClass()}
              placeholder={
                form.source === 'instagram' ? '@username' :
                form.source === 'telegram' ? '@username' :
                form.source === 'whatsapp' ? '+998 90 000 0000' :
                form.source === 'referral' ? 'Referrer name' : 'Optional'
              }
              value={form.sourceHandle}
              onChange={e => set('sourceHandle', e.target.value)}
            />
          </div>

          {/* Name + Age */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Full Name *</label>
              <input className={inputClass('name')} placeholder="Student name" value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Age</label>
              <input className={inputClass()} type="number" placeholder="18" value={form.age} onChange={e => set('age', e.target.value)} />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Phone / Contact *</label>
            <input className={inputClass('phone')} placeholder="+998 90 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* English Score */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">English Score</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {ENGLISH_TESTS.map(t => (
                <button key={t} onClick={() => set('englishTest', t)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    form.englishTest === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                  )}>
                  {t}
                </button>
              ))}
            </div>
            {form.englishTest !== 'None yet' && (
              <input
                className={inputClass()}
                type="number"
                step={form.englishTest === 'IELTS' ? '0.5' : '1'}
                placeholder={
                  form.englishTest === 'IELTS' ? '0–9 (e.g. 6.5)' :
                  form.englishTest === 'TOEFL' ? '0–120' :
                  form.englishTest === 'Duolingo' ? '10–160' :
                  '400–1600'
                }
                value={form.englishScore}
                onChange={e => set('englishScore', e.target.value)}
              />
            )}
          </div>

          {/* Preferred Country */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Interested In (country)</label>
            <div className="flex gap-2 flex-wrap">
              {['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Other'].map(c => (
                <button key={c} onClick={() => set('preferredCountry', c)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    form.preferredCountry === c ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-300'
                  )}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Quick Note (optional)</label>
            <textarea
              className={cn(inputClass(), 'resize-none h-16')}
              placeholder="Any quick notes about this lead..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={cn(
              'flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r',
              selectedSource.color,
            )}
          >
            <Brain size={14} />
            Save Lead
          </button>
        </div>
      </div>
    </div>
  )
}
