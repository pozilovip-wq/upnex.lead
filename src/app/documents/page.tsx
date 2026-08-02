'use client'

import { useState, useRef, useCallback } from 'react'
import Header from '@/components/layout/Header'
import { useStore, DOC_TYPES, AppNotification } from '@/lib/store'
import { cn, getInitials } from '@/lib/utils'
import { FileText, Upload, Check, X, Clock, ChevronDown, AlertCircle, Bell, Copy, Trash2 } from 'lucide-react'

const statusConfig = {
  uploaded: { label: 'Uploaded', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: Check },
  pending:  { label: 'Pending',  color: 'text-amber-600 bg-amber-50 border-amber-200',   icon: Clock },
  missing:  { label: 'Missing',  color: 'text-red-500 bg-red-50 border-red-200',         icon: X },
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
interface UploadModalProps {
  preselectedStudentId?: string
  preselectedDocType?: string
  onClose: () => void
}

function UploadModal({ preselectedStudentId, preselectedDocType, onClose }: UploadModalProps) {
  const { students, docs, setDocStatus } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || '')
  const [selectedDocType, setSelectedDocType]     = useState(preselectedDocType || '')
  const [file, setFile]                           = useState<File | null>(null)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
  const [done, setDone]                           = useState(false)
  const [errors, setErrors]                       = useState<string[]>([])

  const existingEntry = selectedStudentId && selectedDocType
    ? docs[selectedStudentId]?.[selectedDocType]
    : null
  const isAlreadyUploaded = existingEntry?.status === 'uploaded'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setErrors([])
  }

  const validate = () => {
    const errs: string[] = []
    if (!selectedStudentId) errs.push('Select a student')
    if (!selectedDocType)   errs.push('Select a document type')
    if (!file)              errs.push('Choose a file')
    return errs
  }

  const handleUpload = () => {
    const errs = validate()
    if (errs.length) { setErrors(errs); return }

    if (isAlreadyUploaded && !showReplaceConfirm) {
      setShowReplaceConfirm(true)
      return
    }

    // Commit — store metadata only (no binary in localStorage)
    setDocStatus(selectedStudentId, selectedDocType, 'uploaded', file!.name)
    setDone(true)
    setTimeout(onClose, 1200)
  }

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Document Uploaded!</h3>
          <p className="text-slate-400 text-sm">{file?.name}</p>
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
            <h2 className="text-lg font-bold text-slate-800">Upload Document</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select student, type, then file</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Student picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Student *</label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={e => { setSelectedStudentId(e.target.value); setShowReplaceConfirm(false) }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select student —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Doc type grid */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Document Type *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {DOC_TYPES.map(dt => {
                const active = selectedDocType === dt
                const entry = selectedStudentId ? docs[selectedStudentId]?.[dt] : null
                const statusDot = entry?.status === 'uploaded' ? 'bg-emerald-400' : entry?.status === 'pending' ? 'bg-amber-400' : 'bg-slate-200'
                return (
                  <button
                    key={dt}
                    onClick={() => { setSelectedDocType(dt); setShowReplaceConfirm(false) }}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-2 rounded-lg border text-left text-xs font-medium transition-all',
                      active ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', active ? 'bg-white/70' : statusDot)} />
                    <span className="truncate">{dt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Replace warning */}
          {isAlreadyUploaded && selectedDocType && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                <strong>{selectedDocType}</strong> is already uploaded
                {existingEntry?.filename && ` (${existingEntry.filename})`}.{' '}
                {showReplaceConfirm ? 'Click Upload to replace it.' : 'Proceed to replace it.'}
              </p>
            </div>
          )}

          {/* File picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">File * (PDF, JPG, PNG)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'w-full border-2 border-dashed rounded-xl px-4 py-5 text-center transition-colors',
                file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
              )}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={16} className="text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium truncate max-w-xs">{file.name}</span>
                </div>
              ) : (
                <div>
                  <Upload size={20} className="text-slate-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-500">Click to choose file</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG</p>
                </div>
              )}
            </button>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 space-y-1">
              {errors.map(e => (
                <p key={e} className="text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={11} /> {e}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={14} />
            {showReplaceConfirm ? 'Replace File' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ notifications, onMarkRead, onClose }: {
  notifications: AppNotification[]
  onMarkRead: (id: string) => void
  onClose: () => void
}) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    onMarkRead(id)
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Missing Document Alerts</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
          <X size={14} className="text-slate-500" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
        {notifications.length === 0 && (
          <div className="px-4 py-8 text-center">
            <Check size={24} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">All caught up!</p>
          </div>
        )}
        {notifications.map(n => (
          <div key={n.id} className={cn('px-4 py-3', !n.read && 'bg-blue-50/50')}>
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{n.studentName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Missing: {n.missingDocs.join(', ')}
                </p>
              </div>
              {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
            </div>
            <button
              onClick={() => copy(n.id, n.telegramText)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {copied === n.id
                ? <><Check size={11} className="text-emerald-500" /> Copied!</>
                : <><Copy size={11} /> Copy Telegram message</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const { students, docs, notifications, markNotificationRead, clearNotifications, deleteStudent } = useStore()

  const [showUpload, setShowUpload]         = useState(false)
  const [preStudent, setPreStudent]         = useState<string | undefined>()
  const [preDocType, setPreDocType]         = useState<string | undefined>()
  const [showNotifs, setShowNotifs]         = useState(false)
  const [confirmDelete, setConfirmDelete]   = useState<string | null>(null)

  const unread = notifications.filter(n => !n.read).length

  const openUpload = useCallback((studentId?: string, docType?: string) => {
    setPreStudent(studentId)
    setPreDocType(docType)
    setShowUpload(true)
  }, [])

  return (
    <div className="animate-fade-in">
      <Header title="Document Management" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Track document completeness for all students</p>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(v => !v)}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <Bell size={15} className="text-slate-500" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <NotificationPanel
                  notifications={notifications}
                  onMarkRead={markNotificationRead}
                  onClose={() => setShowNotifs(false)}
                />
              )}
            </div>

            <button
              onClick={() => openUpload()}
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Upload size={15} />
              Upload Documents
            </button>
          </div>
        </div>

        {/* Document Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-slate-500 font-semibold w-40">Student</th>
                  {DOC_TYPES.map(doc => (
                    <th key={doc} className="px-2 py-3 text-slate-500 font-medium text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 90 }}>
                      {doc}
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 text-slate-500 font-semibold">Completion</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {students.filter(student => {
                  const studentDocs = docs[student.id] || {}
                  return DOC_TYPES.some(dt => studentDocs[dt]?.status === 'uploaded' || studentDocs[dt]?.status === 'pending')
                }).map(student => {
                  const studentDocs = docs[student.id] || {}
                  const uploaded = DOC_TYPES.filter(dt => studentDocs[dt]?.status === 'uploaded').length
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
                        const entry = studentDocs[doc]
                        const status = entry?.status || 'missing'
                        const cfg = statusConfig[status]
                        const Icon = cfg.icon
                        return (
                          <td key={doc} className="px-2 py-3 text-center">
                            <button
                              onClick={() => openUpload(student.id, doc)}
                              title={`${status === 'uploaded' ? entry?.filename || 'Uploaded' : status} — click to upload`}
                              className={cn(
                                'w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-all hover:scale-110 hover:shadow-sm',
                                cfg.color
                              )}
                            >
                              <Icon size={11} />
                            </button>
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
                      <td className="px-3 py-3 text-center">
                        {confirmDelete === student.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { deleteStudent(student.id); setConfirmDelete(null) }}
                              className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(student.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete student"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
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
          <span className="text-slate-400 ml-2">· Click any cell to upload that document</span>
        </div>
      </div>

      {showUpload && (
        <UploadModal
          preselectedStudentId={preStudent}
          preselectedDocType={preDocType}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}
