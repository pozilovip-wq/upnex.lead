'use client'

import Header from '@/components/layout/Header'
import { MOCK_STUDENTS } from '@/lib/data'
import { cn, getInitials } from '@/lib/utils'
import { FileText, Upload, Check, X, Clock, FolderOpen } from 'lucide-react'

const DOC_TYPES = [
  'Passport', 'Diploma', 'Transcript', 'English Certificate',
  'Financial Documents', 'DS-160', 'I-20', 'Visa', 'Offer Letter'
]

const MOCK_DOCS: Record<string, Record<string, 'uploaded' | 'missing' | 'pending'>> = {
  's1': { 'Passport': 'uploaded', 'Diploma': 'uploaded', 'Transcript': 'pending', 'English Certificate': 'uploaded', 'Financial Documents': 'missing', 'DS-160': 'missing', 'I-20': 'missing', 'Visa': 'missing', 'Offer Letter': 'missing' },
  's2': { 'Passport': 'pending', 'Diploma': 'uploaded', 'Transcript': 'missing', 'English Certificate': 'uploaded', 'Financial Documents': 'missing', 'DS-160': 'missing', 'I-20': 'missing', 'Visa': 'missing', 'Offer Letter': 'missing' },
  's3': { 'Passport': 'uploaded', 'Diploma': 'uploaded', 'Transcript': 'uploaded', 'English Certificate': 'uploaded', 'Financial Documents': 'uploaded', 'DS-160': 'uploaded', 'I-20': 'uploaded', 'Visa': 'pending', 'Offer Letter': 'uploaded' },
  's4': { 'Passport': 'missing', 'Diploma': 'missing', 'Transcript': 'missing', 'English Certificate': 'missing', 'Financial Documents': 'missing', 'DS-160': 'missing', 'I-20': 'missing', 'Visa': 'missing', 'Offer Letter': 'missing' },
  's5': { 'Passport': 'uploaded', 'Diploma': 'uploaded', 'Transcript': 'uploaded', 'English Certificate': 'uploaded', 'Financial Documents': 'uploaded', 'DS-160': 'missing', 'I-20': 'missing', 'Visa': 'missing', 'Offer Letter': 'uploaded' },
  's6': { 'Passport': 'uploaded', 'Diploma': 'uploaded', 'Transcript': 'pending', 'English Certificate': 'uploaded', 'Financial Documents': 'missing', 'DS-160': 'missing', 'I-20': 'missing', 'Visa': 'missing', 'Offer Letter': 'missing' },
}

const statusConfig = {
  uploaded: { label: 'Uploaded', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: Check },
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  missing: { label: 'Missing', color: 'text-red-500 bg-red-50 border-red-200', icon: X },
}

export default function DocumentsPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Document Management" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Track document completeness for all students</p>
          <button className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            <Upload size={15} />
            Upload Documents
          </button>
        </div>

        {/* Document Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-slate-500 font-semibold w-40">Student</th>
                  {DOC_TYPES.map(doc => (
                    <th key={doc} className="px-2 py-3 text-slate-500 font-medium text-center whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 90 }}>
                      {doc}
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 text-slate-500 font-semibold">Completion</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_STUDENTS.map(student => {
                  const docs = MOCK_DOCS[student.id] || {}
                  const uploaded = Object.values(docs).filter(v => v === 'uploaded').length
                  const pct = Math.round((uploaded / DOC_TYPES.length) * 100)
                  return (
                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {getInitials(student.name)}
                          </div>
                          <span className="font-semibold text-slate-700 truncate">{student.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      {DOC_TYPES.map(doc => {
                        const status = docs[doc] || 'missing'
                        const cfg = statusConfig[status]
                        const Icon = cfg.icon
                        return (
                          <td key={doc} className="px-2 py-3 text-center">
                            <div className={cn('w-6 h-6 rounded-md border flex items-center justify-center mx-auto', cfg.color)}>
                              <Icon size={11} />
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={cn('h-1.5 rounded-full', pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={cn('font-semibold text-[10px]', pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500')}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn('w-5 h-5 rounded border flex items-center justify-center', cfg.color)}>
                  <Icon size={10} />
                </div>
                <span className="text-slate-500">{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
